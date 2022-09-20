import React, { ReactNode } from "react";
import Head from "next/head";
import BottomNav from "./BottomNav";
import { useSession } from "next-auth/react";
import TopNav from "./TopNav";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title }: Props) => {
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
    </>
  );
};

export default Layout;
