import { GetServerSideProps } from "next";
import { unstable_getServerSession as getServerSession, User } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "../../server/db/client";
import MessageForm from "../../components/Chat/MessageForm";
import {
  LeftMessageBubble,
  RightMessageBubble,
} from "../../components/Chat/ChatBubble";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { Connection, Message } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import { nanoid } from "nanoid";
import Pusher from "pusher-js";

type PrivateChatRoomProps = {
  connection: Connection & {
    toUser: User;
  };
  messages: (Message & {
    fromUser: { name: string; image: string };
    toUser: { name: string; image: string };
  })[];
};

const PrivateChatRoom: React.FC<PrivateChatRoomProps> = props => {
  const router = useRouter();
  const { data: session } = useSession();
  const [online, setOnline] = useState(false);

  // set ref to textarea and dummy message elements
  const messageRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // get trpc context
  const utils = trpc.useContext();

  // trpc query for getting messages between current and other user
  const messages = trpc.useQuery(
    [
      "message.getMessagesByConnectionChatId",
      { chatId: props.connection.chatId },
    ],
    {
      initialData: props.messages,
    }
  );

  //trpc mutation for sending messages from current user to other user
  const sendMessage = trpc.useMutation("message.createMessage", {
    onMutate(newMessage) {
      const { chatId, connectionId, fromUserId, text, toUserId } = newMessage;
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      utils.cancelQuery(["message.getMessagesByConnectionChatId", { chatId }]);

      // Snapshot the current state of the cache
      const previousMessages = utils.getQueryData([
        "message.getMessagesByConnectionChatId",
        {
          chatId,
        },
      ]);

      // Optimistically update messages to the new state
      if (previousMessages) {
        utils.setQueryData(
          ["message.getMessagesByConnectionChatId", { chatId }],
          [
            {
              id: "temp" + nanoid(),
              connectionId,
              text,
              fromUserId,
              toUserId,
              createdAt: new Date(),
              updatedAt: new Date(),
              fromUser: {
                name: session!.user!.name!,
                image: session!.user!.image!,
              },
              toUser: {
                name: session!.user!.name!,
                image: session!.user!.image!,
              },
            },
            ...previousMessages,
          ]
        );
      }

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError(_err, newMessage, ctx) {
      // If the mutation failed, use the context returned from onMutate to roll back
      utils.setQueryData(
        [
          "message.getMessagesByConnectionChatId",
          { chatId: newMessage.chatId },
        ],
        ctx!.previousMessages!
      );
    },
    onSettled(_data, _error, newMessage) {
      utils.invalidateQueries([
        "message.getMessagesByConnectionChatId",
        { chatId: newMessage.chatId },
      ]);
    },
  });

  // Setup up pusher actions on component mount
  useEffect(() => {
    // Create pusher instance for client
    const pusher = new Pusher("3439d72211e8cfad8d9b", {
      cluster: "ap1",
      channelAuthorization: {
        params: {
          userId: session!.user!.id,
        },
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });

    // Subscribe to a channel
    const chatChannel = pusher.subscribe(`private-${props.connection.chatId}`);
    const presenceChannel = pusher.subscribe(
      `presence-${props.connection.chatId}`
    );

    // bind presence channel events
    presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
      if (members.count > 1) {
        setOnline(true);
      }
    });

    presenceChannel.bind("pusher:member_added", (member: any) => {
      if (member.id !== session!.user!.id) setOnline(true);
    });

    presenceChannel.bind("pusher:member_removed", (member: any) => {
      if (member.id !== session!.user!.id) setOnline(false);
    });

    // bind chat channel events
    chatChannel.bind("pusher:subscription_error", (status: any) => {
      console.log("subscription error", status);
    });

    chatChannel.bind("message-event", (data: any) => {
      const { sender, text, createdAt } = data;

      if (sender.id === session!.user!.id) return;

      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      utils.cancelQuery([
        "message.getMessagesByConnectionChatId",
        { chatId: props.connection.chatId },
      ]);

      // Snapshot the current state of the cache
      const previousMessages = utils.getQueryData([
        "message.getMessagesByConnectionChatId",
        {
          chatId: props.connection.chatId,
        },
      ]);

      // Optimistically update messages to the new state
      if (previousMessages) {
        utils.setQueryData(
          [
            "message.getMessagesByConnectionChatId",
            { chatId: props.connection.chatId },
          ],
          [
            {
              id: "temp" + nanoid(),
              connectionId: props.connection.id,
              text,
              fromUserId: sender.id,
              toUserId: session!.user!.id!,
              createdAt: new Date(createdAt),
              updatedAt: new Date(),
              fromUser: {
                name: sender.name,
                image: sender.image,
              },
              toUser: {
                name: "temp",
                image: "temp",
              },
            },
            ...previousMessages,
          ]
        );
      }
    });

    // Scroll to the latest message
    messageRef.current?.scrollIntoView();

    return () => {
      // Clean up subscription to channel when component is unmounted
      pusher.unsubscribe(`private-${props.connection.chatId}`);
      pusher.unsubscribe(`presence-${props.connection.chatId}`);
    };
  }, []);

  // handle sending of message by triggering pusher action on pusher via /api/pusher
  const handleSubmit = async (
    e: any,
    messageToSend: string,
    setMessageToSend: Dispatch<SetStateAction<string>>
  ) => {
    e.preventDefault();
    const text = messageToSend.trim();
    if (!text) return;

    // Optimistically clear message input
    setMessageToSend("");

    // Scroll to the latest message
    messageRef.current?.scrollIntoView();

    // Refocus on textarea
    textareaRef.current?.focus();

    // trpc muation to create message in database
    sendMessage.mutate({
      chatId: props.connection.chatId,
      connectionId: props.connection.id,
      fromUserId: props.connection.fromUserId,
      toUserId: props.connection.toUserId,
      text: messageToSend,
    });

    // send message to private chat channel
    try {
      await axios.post("/api/pusher", {
        channel: `private-${props.connection.chatId}`,
        event: "message-event",
        data: {
          text,
          createdAt: new Date().toISOString(),
          sender: session?.user,
        },
      });
    } catch (err) {
      console.log(err);
    }

    // send message to recipient user stream
    try {
      await axios.post("/api/pusher", {
        channel: `private-user-${props.connection.toUserId}`,
        event: "message-alert-event",
        data: {
          text,
          createdAt: new Date().toISOString(),
          sender: session?.user,
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-primary/30">
      {/* Top nav */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 border-b shadow-sm">
        <button
          className="relative btn btn-circle btn-sm bg-transparent border-none text-neutral hover:text-white"
          onClick={() => router.back()}
        >
          <ChevronLeftIcon className="h-6 w-6 absolute right-1.5" />
        </button>
        <div className={`avatar ${online && "online"}`}>
          <div className="w-12 rounded-full">
            <img src={props.connection.toUser.image!} alt="avatar" />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-xl font-bold">{props.connection.toUser.name}</p>
          <p className="text-sm text-stone-500">Make some coffee chat</p>
        </div>
      </div>

      {/* Message bubble area */}
      <div className="mt-auto flex flex-col-reverse gap-0.5 overflow-y-auto p-2 py-2">
        <div ref={messageRef}></div>
        {messages.data?.map((message, idx, arr) => {
          return (
            <div key={message.id}>
              {message.fromUserId === session?.user?.id ? (
                <RightMessageBubble
                  data={message}
                  isImage={arr[idx - 1]?.fromUserId !== message.fromUserId}
                  isFirst={arr[idx + 1]?.fromUserId !== message.fromUserId}
                />
              ) : (
                <LeftMessageBubble
                  data={message}
                  isImage={arr[idx - 1]?.fromUserId !== message.fromUserId}
                  isFirst={arr[idx + 1]?.fromUserId !== message.fromUserId}
                />
              )}
            </div>
          );
        })}
      </div>
      <MessageForm innerRef={textareaRef} handleSubmit={handleSubmit} />
    </div>
  );
};

export default PrivateChatRoom;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const chatId = ctx.params?.chatId as string;

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const connection = await prisma.connection.findFirst({
    where: {
      fromUserId: session.user?.id,
      chatId,
    },
    include: {
      toUser: true,
    },
  });

  if (!connection) {
    return {
      redirect: {
        destination: "/chat",
        permanent: false,
      },
    };
  }

  const messages = await prisma.message.findMany({
    where: {
      connection: {
        chatId,
      },
    },
    include: {
      fromUser: {
        select: {
          name: true,
          image: true,
        },
      },
      toUser: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    props: {
      session,
      connection: JSON.parse(JSON.stringify(connection)),
      messages: JSON.parse(JSON.stringify(messages)),
    },
  };
};
