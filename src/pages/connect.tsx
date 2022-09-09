import { Profile, User } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import Head from "next/head";
import { ReactElement } from "react";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import Layout from "../components/Layout";
import { prisma } from "../server/db/client";
import { authOptions } from "./api/auth/[...nextauth]";
import type { NextPageWithLayout } from "./_app";

type EventPageProps = {
  users: (User & {
    profile: Profile;
  })[];
};

const ConnectPage: NextPageWithLayout<EventPageProps> = ({ users }) => {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-4 mt-4 p-4">
        <h1 className="text-4xl font-bold text-center">Connect</h1>
        <div className="flex flex-col w-full max-w-md">
          {users.map((user, idx) => (
            <div key={user.id}>
              <div className="flex items-center gap-2 p-2">
                <div className="avatar online">
                  <div className="w-12 rounded-full">
                    <img src={user.image!} />
                  </div>
                </div>
                <div className="w-full">
                  <h1 className="font-bold">{user.name}</h1>
                  <p className="text-xs">{user.email}</p>
                </div>
                <button className="btn btn-sm ml-auto">connect</button>
              </div>
              {idx != users.length - 1 && <div className="divider m-0"></div>}
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const users = await prisma.user.findMany({
    include: {
      profile: true,
    },
    where: {
      id: {
        not: session?.user?.id,
      },
    },
  });
  return {
    props: {
      users,
    },
  };
};
export default ConnectPage;

ConnectPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="Connect page">{page}</Layout>;
};
