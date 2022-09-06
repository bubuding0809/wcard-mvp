import type { NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { authOptions } from "../api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Header from "../../components/Header/Header";
import { prisma } from "../../server/db/client";
import { EventCard } from "../../components/Event/EventCard";
import Link from "next/link";
import { User } from "@prisma/client";

type EventPageProps = {
  user: User;
};

const EventPage: NextPage<EventPageProps> = ({ user }) => {
  const { data: session, status } = useSession();

  if (!session)
    return (
      <div>
        <h1 className="text-4xl font-bold text-center">Events</h1>
        <div>
          <h1 className="text-2xl text-center">User {status}...</h1>
        </div>
      </div>
    );

  const userEvents = trpc.useQuery([
    "event.getEventsByUserId",
    { userId: session!.user!.id },
  ]);

  return (
    <>
      <Head>
        <title>Events</title>
        <meta name="description" content="WCard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex flex-col items-center gap-4 mt-4 p-4">
        <h1 className="text-4xl font-bold text-center">Events</h1>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4">
          {userEvents.data?.map(event => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <a>
                <EventCard event={event} />
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export default EventPage;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session) {
    return {
      props: {},
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
  });

  return {
    props: {
      session,
      user,
    },
  };
};
