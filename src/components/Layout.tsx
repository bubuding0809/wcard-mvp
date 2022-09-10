import React, { ReactNode } from "react";
import Head from "next/head";
import BottomNav from "./BottomNav";

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
      {children}
      <BottomNav />
    </>
  );
};

export default Layout;
