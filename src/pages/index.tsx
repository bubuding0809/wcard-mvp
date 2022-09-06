import type { NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import React from "react";
import { trpc } from "../utils/trpc";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Header from "../components/Header/Header";
import { User } from "@prisma/client";
import { prisma } from "../server/db/client";
import Link from "next/link";

type HomeProps = {
  user: User;
};

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const Home: NextPage<HomeProps> = props => {
  const { data: session, status } = useSession();
  const user = trpc.useQuery(["user.getUserById", { id: session!.user!.id }], {
    initialData: props.user,
  });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="WCard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="flex flex-col items-center pt-4">
        <h1 className="text-4xl font-bold text-center">
          {status === "loading" ? "loading..." : status}
        </h1>
        <Link href="/events">
          <a className="hover:text-blue-400 hover:underline">Events</a>
        </Link>
      </div>

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Create <span className="text-purple-300">T3</span> App
        </h1>
        <p className="text-2xl text-gray-700">This stack uses:</p>
        <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 lg:w-2/3">
          <TechnologyCard
            name="NextJS"
            description="The React framework for production"
            documentation="https://nextjs.org/"
          />
          <TechnologyCard
            name="TypeScript"
            description="Strongly typed programming language that builds on JavaScript, giving you better tooling at any scale"
            documentation="https://www.typescriptlang.org/"
          />
          <TechnologyCard
            name="TailwindCSS"
            description="Rapidly build modern websites without ever leaving your HTML"
            documentation="https://tailwindcss.com/"
          />
          <TechnologyCard
            name="tRPC"
            description="End-to-end typesafe APIs made easy"
            documentation="https://trpc.io/"
          />
        </div>
        {user.isLoading && (
          <div className="pt-6 text-2xl text-blue-500 flex justify-center items-center w-full">
            <p>Loading...</p>
          </div>
        )}
        {user.isFetching && <div>fetching....</div>}
        {user.data && (
          <div className="pt-6 text-2xl text-blue-500 flex flex-col justify-center items-center w-full">
            <p>id: {user.data.id}</p>
            <p>email: {user.data.email}</p>
            <p>name: {user.data.name}</p>
          </div>
        )}
        {user.isError && (
          <div className="pt-6 text-2xl text-blue-500 flex flex-col justify-center items-center w-full">
            <p>Something went wrong {JSON.stringify(user.error)}</p>
          </div>
        )}
      </main>
    </>
  );
};

const TechnologyCard = ({
  name,
  description,
  documentation,
}: TechnologyCardProps) => {
  return (
    <section className="flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
      <h2 className="text-lg text-gray-700">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <a
        className="mt-3 text-sm underline text-violet-500 decoration-dotted underline-offset-2"
        href={documentation}
        target="_blank"
        rel="noreferrer"
      >
        Documentation
      </a>
    </section>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "api/auth/signin",
        permanent: false,
      },
      props: {},
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user!.id,
    },
  });

  return {
    props: {
      user,
      session,
    },
  };
};
export default Home;
