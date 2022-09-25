import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import { unstable_getServerSession as getServerSession, User } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import Layout from "../../components/Layout";

const ChatPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <main></main>
    </>
  );
};

export default ChatPage;

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

ChatPage.getLayout = (page: ReactElement) => {
  return <Layout title="Chat">{page}</Layout>;
};
