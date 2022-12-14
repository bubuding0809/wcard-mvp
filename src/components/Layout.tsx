import React, { ReactNode } from "react";
import Head from "next/head";
import BottomNav from "./BottomNav";
import Spacer from "./Spacer";

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
      <Spacer />
      <BottomNav />
    </>
  );
};

export default Layout;
