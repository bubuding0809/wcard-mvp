import { FormEventHandler, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import axios from "axios";
import { GetServerSideProps } from "next";
import { unstable_getServerSession as getServerSession, User } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import TextareaAutosize from "react-textarea-autosize";
import {
  LeftMessageBubble,
  RightMessageBubble,
} from "../../components/Chat/ChatBubble";

type chatMessageData = {
  message: string;
  sender: User;
  createdAt: string;
};

const Chat = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [chats, setChats] = useState<chatMessageData[]>([]);
  const [messageToSend, setMessageToSend] = useState("");
  const messageRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Setup up pusher actions on component mount
  useEffect(() => {
    // Create pusher instance for client
    const pusher = new Pusher("3439d72211e8cfad8d9b", {
      cluster: "ap1",
    });

    // Subscribe to a channel
    const channel = pusher.subscribe("chat-public");

    // bind event triggered on channel to callback function
    channel.bind("message-event", (data: any) => {
      const { sender, message, createdAt } = data;
      setChats(prevState => [{ sender, message, createdAt }, ...prevState]);
    });

    // Scroll to the latest message
    messageRef.current?.scrollIntoView();

    return () => {
      // Clean up subscription to channel when component is unmounted
      pusher.unsubscribe("chat-public");
    };
  }, []);

  // handle sending of message by triggering pusher action on pusher via /api/pusher
  const handleSubmit: FormEventHandler<
    HTMLFormElement | HTMLTextAreaElement
  > = async e => {
    e.preventDefault();
    const message = messageToSend.trim();

    if (!message) return;

    // Scroll to the latest message
    messageRef.current?.scrollIntoView();

    // Refocus on textarea
    textareaRef.current?.focus();

    try {
      await axios.post("/api/pusher", {
        message,
        createdAt: new Date().toISOString(),
        sender: session?.user,
        chatId: "chat-public",
      });
    } catch (err) {
      console.log(err);
    }

    setMessageToSend("");
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
        <div className="avatar">
          <div className="w-12 rounded-full">
            <img src={session!.user!.image!} alt="avatar" />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-xl">
            Hello, <span className="font-bold">{session?.user?.name}</span>
          </p>
          <p className="text-sm text-stone-500">
            Have a chat and make connections
          </p>
        </div>
      </div>

      {/* Message bubble area */}
      <div className="mt-auto flex flex-col-reverse gap-0.5 overflow-y-auto p-2 py-2">
        <div ref={messageRef}></div>
        {chats.map((chat, idx, array) => {
          return (
            <div key={chat.createdAt}>
              {chat.sender.name === session?.user?.name ? (
                <RightMessageBubble
                  data={chat}
                  isImage={array[idx - 1]?.sender.id !== chat.sender.id}
                  isFirst={array[idx + 1]?.sender.id !== chat.sender.id}
                />
              ) : (
                <LeftMessageBubble
                  data={chat}
                  isImage={array[idx - 1]?.sender.id !== chat.sender.id}
                  isFirst={array[idx + 1]?.sender.id !== chat.sender.id}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Message input */}
      <div className="w-full px-2 bg-slate-50 p-2">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 items-center">
            <TextareaAutosize
              ref={textareaRef}
              className="w-full rounded-lg p-3 leading-5 resize-none"
              maxRows={4}
              value={messageToSend}
              onChange={e => setMessageToSend(e.target.value)}
              placeholder="Send something..."
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button className="btn btn-square btn-md self-end" type="submit">
              <PaperAirplaneIcon className="w-6 h-auto" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};