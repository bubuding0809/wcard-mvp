import {
  Connection,
  Invite,
  Profile,
  User,
  InviteStatus,
} from "@prisma/client";
import { GetServerSideProps } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactElement, useMemo } from "react";
import Layout from "../components/Layout";
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import { authOptions } from "./api/auth/[...nextauth]";
import type { NextPageWithLayout } from "./_app";
import {
  ClockIcon,
  LockClosedIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

type EventPageProps = {
  users: (User & {
    profile: Profile;
  })[];
  invitesSent: Invite[];
  invitesReceived: Invite[];
  connections: Connection[];
};

const ConnectPage: NextPageWithLayout<EventPageProps> = props => {
  const utils = trpc.useContext();
  const { data: session } = useSession();

  // get all invites sent by current user
  const invitesSent = trpc.useQuery(
    ["invite.getInvitesSentByUserId", { id: session!.user!.id }],
    {
      initialData: props.invitesSent,
    }
  );

  // get all invites received by current user
  const invitesReceived = trpc.useQuery(
    ["invite.getInvitesReceivedByUserId", { id: session!.user!.id }],
    { initialData: props.invitesReceived }
  );

  // get all connections for current user
  const connections = trpc.useQuery(
    ["connection.getConnectionsByUserId", { id: session!.user!.id }],
    {
      initialData: props.connections,
    }
  );

  // mutation hook for sending invites
  const createInvite = trpc.useMutation("invite.createInvite", {
    async onMutate(variables) {
      const { fromUserId, toUserId } = variables;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      utils.cancelQuery(["invite.getInvitesSentByUserId", { id: fromUserId }]);

      // Snapshot the current state of the cache
      const prevInvites = utils.getQueryData([
        "invite.getInvitesSentByUserId",
        {
          id: fromUserId,
        },
      ]);

      // Optimistically update invites to new state
      if (prevInvites) {
        utils.setQueryData(
          [
            "invite.getInvitesSentByUserId",
            {
              id: fromUserId,
            },
          ],
          [
            ...prevInvites!,
            {
              id: "temp",
              fromUserId,
              toUserId,
              status: "PENDING",
              locationId: null,
              createdAt: new Date(),
            },
          ]
        );
      }

      return {
        // Return a context object with the snapshotted value for rollback incase of error
        prevInvites,
      };
    },
    onError(_err, newInvite, ctx) {
      utils.setQueryData(
        [
          "invite.getInvitesSentByUserId",
          {
            id: newInvite.fromUserId,
          },
        ],
        ctx!.prevInvites!
      );
    },
    onSettled(_data, _error, newInvite) {
      utils.invalidateQueries([
        "invite.getInvitesSentByUserId",
        {
          id: newInvite.fromUserId,
        },
      ]);
    },
  });

  // mutation hook for accepting/rejecting invites
  const updateInvite = trpc.useMutation("invite.updateInvite", {
    async onMutate(variables) {
      const { fromUserId, inviteId, status } = variables;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      utils.cancelQuery([
        "invite.getInvitesReceivedByUserId",
        { id: fromUserId },
      ]);

      // Snapshot the current state of the cache
      const prevInvites = utils.getQueryData([
        "invite.getInvitesReceivedByUserId",
        {
          id: fromUserId,
        },
      ]);

      // Optimistically update invites to new state
      if (prevInvites) {
        utils.setQueryData(
          [
            "invite.getInvitesReceivedByUserId",
            {
              id: fromUserId,
            },
          ],
          prevInvites.map(invite => {
            if (invite.id === inviteId) {
              return {
                ...invite,
                status: status as InviteStatus,
              };
            }
            return invite;
          })
        );
      }

      return {
        // Return a context object with the snapshotted value for rollback incase of error
        prevInvites,
      };
    },
    onError(_err, newInvite, ctx) {
      utils.setQueryData(
        ["invite.getInvitesSentByUserId", { id: newInvite.fromUserId }],
        ctx!.prevInvites!
      );
    },
    onSettled(_data, _error, newInvite) {
      utils.invalidateQueries([
        "invite.getInvitesSentByUserId",
        { id: newInvite.fromUserId },
      ]);
    },
  });

  // mutation hook for creating connections between 2 users
  const createConnection = trpc.useMutation("connection.createConnection", {
    async onMutate(variables) {
      const { fromUserId, toUserId } = variables;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      utils.cancelQuery([
        "connection.getConnectionsByUserId",
        { id: fromUserId },
      ]);

      // Snapshot the current state of the cache
      const prevConnections = utils.getQueryData([
        "connection.getConnectionsByUserId",
        {
          id: fromUserId,
        },
      ]);

      // Optimistically update invites to new state
      if (prevConnections) {
        utils.setQueryData(
          [
            "connection.getConnectionsByUserId",
            {
              id: fromUserId,
            },
          ],
          [
            ...prevConnections,
            {
              id: "temp",
              fromUserId,
              toUserId,
              createdAt: new Date(),
              chatId: "temp",
            },
          ]
        );
      }

      // Return a context object with the snapshotted value for rollback incase of error
      return {
        prevConnections,
      };
    },
    onError(_err, newConnection, ctx) {
      utils.setQueryData(
        ["connection.getConnectionsByUserId", { id: newConnection.fromUserId }],
        ctx!.prevConnections!
      );
    },
    onSettled(_data, _error, newConnection) {
      utils.invalidateQueries([
        "connection.getConnectionsByUserId",
        { id: newConnection.fromUserId },
      ]);
    },
  });

  //mutation hook for deleting invite
  const deleteInvite = trpc.useMutation("invite.deleteInvite", {
    async onMutate(variables) {
      const { fromUserId, inviteId } = variables;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      utils.cancelQuery(["invite.getInvitesSentByUserId", { id: fromUserId }]);

      // Snapshot the current state of the cache
      const prevInvites = utils.getQueryData([
        "invite.getInvitesSentByUserId",
        {
          id: fromUserId,
        },
      ]);

      // Optimistically update invites to new state
      if (prevInvites) {
        utils.setQueryData(
          [
            "invite.getInvitesSentByUserId",
            {
              id: fromUserId,
            },
          ],
          prevInvites.filter(invite => invite.id !== inviteId)
        );
      }

      return {
        // Return a context object with the snapshotted value for rollback incase of error
        prevInvites,
      };
    },
    onError(_err, deletedInvite, ctx) {
      utils.setQueryData(
        [
          "invite.getInvitesSentByUserId",
          {
            id: deletedInvite.fromUserId,
          },
        ],
        ctx!.prevInvites!
      );
    },
    onSettled(_data, _error, deletedInvite) {
      utils.invalidateQueries([
        "invite.getInvitesSentByUserId",
        {
          id: deletedInvite.fromUserId,
        },
      ]);
    },
  });

  // parse invites sent by current user into a map of to user id to invite data
  const invitesSentMap = useMemo(() => {
    const map = new Map();
    invitesSent.data?.forEach(invite => map.set(invite.toUserId, invite));
    return map as Map<string, Invite>;
  }, [invitesSent.data]);

  // parse invites received by current user into a map of from user id to invite data
  const invitesReceivedMap = useMemo(() => {
    const map = new Map();
    invitesReceived.data?.forEach(invite => map.set(invite.fromUserId, invite));
    return map as Map<string, Invite>;
  }, [invitesReceived.data]);

  // parse connections for current user into a map of to user id to connection data
  const connectionsMap = useMemo(() => {
    const map = new Map();
    connections.data?.forEach(connection => {
      map.set(connection.toUserId, connection);
    });
    return map as Map<string, Connection>;
  }, [connections]);

  // process connection status and render a action component accordingly for user
  const getConnectionStatus = (toUserId: string) => {
    const inviteSent = invitesSentMap.get(toUserId);
    const inviteReceived = invitesReceivedMap.get(toUserId);
    const connection = connectionsMap.get(toUserId);

    // if there is a connection, return a message button
    if (connection) {
      return (
        <Link href={`/chat/${connection.chatId}`}>
          <button className="btn btn-primary btn-sm ml-auto text-xs gap-1">
            message
          </button>
        </Link>
      );
    }

    // if a invite was recieved, return a accept/reject button
    if (inviteReceived && inviteReceived.status === "PENDING") {
      return (
        <div className="flex gap-2">
          <button
            className="btn btn-circle btn-sm ml-auto text-xs gap-1"
            onClick={() => {
              // accept invite
              updateInvite.mutate({
                fromUserId: session!.user!.id,
                inviteId: inviteReceived.id,
                status: "ACCEPTED",
              });
              // create connection
              createConnection.mutate({
                fromUserId: session!.user!.id,
                toUserId: inviteReceived.fromUserId,
              });
            }}
          >
            <CheckIcon className="w-5" />
          </button>
          <button
            className="btn btn-circle btn-sm btn-outline ml-auto text-xs gap-1"
            onClick={() => {
              // decline invite
              updateInvite.mutate({
                fromUserId: session!.user!.id,
                inviteId: inviteReceived.id,
                status: "REJECTED",
              });
            }}
          >
            <XMarkIcon className="w-5" />
          </button>
        </div>
      );
    }

    if (inviteReceived && inviteReceived.status === "REJECTED") {
      return (
        <button
          className="btn btn-circle btn-sm ml-auto text-xs gap-1"
          onClick={() => {
            // accept invite
            updateInvite.mutate({
              fromUserId: session!.user!.id,
              inviteId: inviteReceived.id,
              status: "ACCEPTED",
            });
            // create connection
            createConnection.mutate({
              fromUserId: session!.user!.id,
              toUserId: inviteReceived.fromUserId,
            });
          }}
        >
          <CheckIcon className="w-5" />
        </button>
      );
    }

    // if no invite was sent, return a connect button
    if (!inviteSent) {
      return (
        <button
          className="btn btn-sm ml-auto text-xs"
          onClick={() =>
            // send invite
            createInvite.mutate({
              fromUserId: session!.user!.id,
              toUserId,
            })
          }
        >
          connect
        </button>
      );
    }

    // if a invite was sent check invite status
    switch (inviteSent.status) {
      // if status is pending, return a cancel button with pending indicator
      case "PENDING":
        return (
          <button
            className="btn btn-active btn-ghost btn-sm ml-auto text-xs gap-1 pl-2"
            onClick={() => {
              // delete invite
              deleteInvite.mutate({
                fromUserId: session!.user!.id,
                inviteId: inviteSent.id,
              });
            }}
          >
            <ClockIcon className="w-5" /> cancel
          </button>
        );
      // if status is declined, return a disabled closed button
      case "REJECTED":
        return (
          <button className="btn btn-sm ml-auto text-xs gap-1 pl-2" disabled>
            <LockClosedIcon className="w-5" />
            Closed
          </button>
        );
    }
  };

  return (
    <>
      <main className="flex flex-col items-center gap-4 mt-4 p-4">
        <div className="flex flex-col w-full max-w-md">
          {props.users.map((user, idx) => (
            <div key={user.id}>
              <div className="flex items-center gap-2 p-2">
                <div className="avatar online">
                  <div className="w-12 rounded-full">
                    <img src={user.image!} alt={user.name + "'s image"} />
                  </div>
                </div>
                <div className="w-full">
                  <h1 className="font-bold">{user.name}</h1>
                  <p className="text-xs">{user.email}</p>
                </div>
                {getConnectionStatus(user.id)}
              </div>
              {idx != props.users.length - 1 && (
                <div className="divider m-0"></div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
};
export default ConnectPage;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  // get all users except the current user
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

  // get invites sent by the current user
  const invitesSent = await prisma.invite.findMany({
    where: { fromUserId: session?.user?.id },
  });

  // get invites received by the current user
  const invitesReceived = await prisma.invite.findMany({
    where: { toUserId: session?.user?.id },
  });

  // get all user connections
  const connections = await prisma.connection.findMany({
    where: {
      fromUserId: session?.user?.id,
    },
  });

  return {
    props: {
      session,
      users,
      invitesSent: JSON.parse(JSON.stringify(invitesSent)),
      invitesReceived: JSON.parse(JSON.stringify(invitesReceived)),
      connections: JSON.parse(JSON.stringify(connections)),
    },
  };
};

ConnectPage.getLayout = (page: ReactElement) => {
  return <Layout title="Connect">{page}</Layout>;
};
