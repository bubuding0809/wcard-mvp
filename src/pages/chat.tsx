import { FormEventHandler, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import axios from "axios";
import { GetServerSideProps } from "next";
import { unstable_getServerSession as getServerSession, User } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import TextareaAutosize from "react-textarea-autosize";

type chatMessageData = {
  message: string;
  sender: User;
  createdAt: string;
};

type MessageBubbleProps = {
  data: chatMessageData;
  isImage: boolean;
  isFirst: boolean;
};

const LeftMessageBubble: React.FC<MessageBubbleProps> = ({
  isImage,
  isFirst,
  data,
}) => {
  const { message, sender, createdAt } = data;
  return (
    <div className="flex gap-2 items-end self-start">
      <div className="avatar">
        <div className="w-8 rounded-full">
          {isImage && <img src={sender.image!} alt="avatar" />}
        </div>
      </div>
      <p
        className={`border rounded-r-3xl rounded-l-lg p-2 px-4 bg-slate-100 whitespace-pre-line leading-5 max-w-[75%] mr-auto overflow-hidden text-ellipsis        ${
          isImage && "rounded-bl-3xl"
        } 
        ${isFirst && "rounded-tl-3xl"}`}
      >
        {message}
        <span className="ml-1.5 text-xs italic text-indigo-400">
          {new Date(createdAt).toLocaleString("en", {
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
      </p>
    </div>
  );
};

const RightMessageBubble: React.FC<MessageBubbleProps> = ({
  isImage,
  isFirst,
  data,
}) => {
  const { message, sender, createdAt } = data;
  return (
    <div
      className={`flex gap-2 items-end self-end ${isImage && "mb-2"} ${
        isFirst && "mt-2"
      }`}
    >
      <p
        className={`border rounded-l-3xl rounded-r-lg p-2 px-4 bg-emerald-50/80 whitespace-pre-line leading-5 max-w-[75%] ml-auto overflow-hidden text-ellipsis
        ${isImage && "rounded-br-3xl"} 
        ${isFirst && "rounded-tr-3xl"}
        `}
      >
        {message}
        <span className="ml-1.5 text-xs italic text-indigo-400">
          {new Date(createdAt).toLocaleString("en", {
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
      </p>
      <div className="avatar">
        <div className="w-8 rounded-full">
          {isImage && <img src={sender.image!} alt="avatar" />}
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [chats, setChats] = useState<chatMessageData[]>([]);
  const [messageToSend, setMessageToSend] = useState("");
  const messageRef = useRef<HTMLDivElement>(null);

  // Setup up pusher actions on component mount
  useEffect(() => {
    // Create pusher instance for client
    const pusher = new Pusher("3439d72211e8cfad8d9b", {
      cluster: "ap1",
    });

    // Subscribe to a channel
    const channel = pusher.subscribe("chat");

    // bind event triggered on channel to callback function
    channel.bind("message-event", (data: any) => {
      const { sender, message, createdAt } = data;
      setChats(prevState => [{ sender, message, createdAt }, ...prevState]);
    });

    // Scroll to the latest message
    messageRef.current?.scrollIntoView();

    return () => {
      // Clean up subscription to channel when component is unmounted
      pusher.unsubscribe("chat");
    };
  }, []);

  // handle sending of message by triggering pusher action on pusher via /api/pusher
  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    if (!messageToSend) return;

    // Scroll to the latest message
    messageRef.current?.scrollIntoView();

    try {
      await axios.post("/api/pusher", {
        message: messageToSend,
        createdAt: new Date().toISOString(),
        sender: session?.user,
      });
    } catch (err) {
      console.log(err);
    }

    setMessageToSend("");
  };

  return (
    <div className="flex flex-col h-screen bg-indigo-200">
      {/* Top nav */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 border-b shadow-sm">
        <button className="btn" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-5 w-5 text-white" />
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
          <p className="text-sm text-stone-500">A donkey aint no poggers</p>
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

      <div className="p-8"></div>

      {/* Message input */}
      <div className="fixed bottom-0 w-full px-2 bg-slate-50 p-2">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 items-center">
            <TextareaAutosize
              className="w-full rounded-lg p-3 leading-5 resize-none"
              maxRows={4}
              value={messageToSend}
              onChange={e => setMessageToSend(e.target.value)}
              placeholder="Send something..."
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
