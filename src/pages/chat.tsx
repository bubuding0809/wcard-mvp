import { FormEventHandler, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import axios from "axios";
import Spacer from "../components/Spacer";
import { GetServerSideProps } from "next";
import { unstable_getServerSession as getServerSession, User } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

type chatMessageData = {
  message: string;
  sender: User;
};

const LeftMessageBubble: React.FC<
  chatMessageData & { idx: number; isImage: boolean }
> = ({ message, sender, idx, isImage }) => {
  return (
    <div key={idx} className="flex gap-2 items-end self-start">
      <div className="avatar">
        <div className="w-8 rounded-full">
          {isImage && <img src={sender.image!} alt="avatar" />}
        </div>
      </div>
      <p
        className={`indent border rounded-full ${
          isImage && "rounded-bl-none"
        } p-1 px-3 bg-slate-100`}
      >
        {message}
      </p>
    </div>
  );
};

const RightMessageBubble: React.FC<
  chatMessageData & { idx: number; isImage: boolean }
> = ({ message, sender, idx, isImage }) => {
  return (
    <div key={idx} className="flex gap-2 items-end self-end">
      <p
        className={`indent border rounded-full ${
          isImage && "rounded-br-none"
        } p-1 px-3 bg-slate-100`}
      >
        {message}
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

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pusher = new Pusher("3439d72211e8cfad8d9b", {
      cluster: "ap1",
    });

    const channel = pusher.subscribe("chat");
    channel.bind("message-event", (data: any) => {
      setChats(prevState => [
        ...prevState,
        { sender: data.sender, message: data.message },
      ]);
    });

    return () => {
      pusher.unsubscribe("chat");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    try {
      await axios.post("/api/pusher", {
        message: messageToSend,
        sender: session?.user,
      });
    } catch (err) {
      console.log(err);
    }

    setMessageToSend("");
  };

  return (
    <div className="flex flex-col gap-2 h-screen">
      <Spacer />
      <div className="ml-2 flex items-center gap-2">
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

      <div className="flex flex-col bg-indigo-100 gap-0.5 p-4 h-full overflow-y-auto">
        {chats.map((chat, idx, array) => {
          return chat.sender.name === session?.user?.name ? (
            <RightMessageBubble
              message={chat.message}
              sender={chat.sender}
              idx={idx}
              isImage={array[idx + 1]?.sender.id !== chat.sender.id}
            />
          ) : (
            <LeftMessageBubble
              message={chat.message}
              sender={chat.sender}
              idx={idx}
              isImage={array[idx + 1]?.sender.id !== chat.sender.id}
            />
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      <div className="w-ful px-2">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              className="w-full rounded-lg whitespace-pre-wrap"
              type="text"
              value={messageToSend}
              onChange={e => setMessageToSend(e.target.value)}
              placeholder="start typing...."
            />
            <button className="btn" type="submit">
              Send
            </button>
          </div>
        </form>
      </div>
      <Spacer />
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
