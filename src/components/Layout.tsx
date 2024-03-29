import React, { ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import BottomNav from "./BottomNav";
import { useSession } from "next-auth/react";
import TopNav from "./TopNav";
import Pusher from "pusher-js";
import { ToastContainer, toast, Id } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title }: Props) => {
  const { data: session } = useSession();
  const toastId = React.useRef<Id>();

  // subscribe user to personal stream channel
  useEffect(() => {
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
    const userStream = pusher.subscribe("private-user-" + session?.user?.id);
    userStream.bind("message-alert-event", (data: any) => {
      const { text, sender, createdAt } = data;
      const sentDateTime = new Date(createdAt);

      //remove previous toast
      toast.dismiss();
      toastId.current = toast(
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-900">{sender.name}</p>
            <p className="text-xs font-thin">
              {sentDateTime.toLocaleString("en", {
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
          </div>
          <p className="text-sm text-gray-500">{text}</p>
        </div>,
        {
          position: "top-right",
          icon: <ChatBubbleBottomCenterTextIcon />,
        }
      );
    });

    return () => pusher.unsubscribe("private-user-" + session?.user?.id);
  }, []);

  return (
    <>
      <Head>
        <title>{title ?? "WCard page"}</title>
        <meta name="description" content="WCard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav title={title!} />
      {children}
      <div className="p-8"></div>
      <BottomNav />
      <ToastContainer draggablePercent={50} hideProgressBar />
    </>
  );
};

export default Layout;
