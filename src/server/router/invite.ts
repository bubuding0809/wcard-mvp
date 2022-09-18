import { z } from "zod";
import { createProtectedRouter } from "./protected-router";
import { InviteStatus } from "@prisma/client";

// protected router with queries that can only be hit if the user requesting is signed in
export const inviteRouter = createProtectedRouter()
  .query("getInvitesSentByUserId", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.invite.findMany({
        where: { fromUserId: input.id },
      });
    },
  })
  .query("getInvitesReceivedByUserId", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.invite.findMany({
        where: { toUserId: input.id },
      });
    },
  })
  .mutation("createInvite", {
    input: z.object({
      fromUserId: z.string(),
      toUserId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.invite.create({
        data: {
          fromUser: { connect: { id: input.fromUserId } },
          toUser: { connect: { id: input.toUserId } },
        },
      });
    },
  })
  .mutation("updateInvite", {
    input: z.object({
      fromUserId: z.string(),
      inviteId: z.string(),
      status: z.enum(["ACCEPTED", "REJECTED", "PENDING"]),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.invite.update({
        where: { id: input.inviteId },
        data: {
          status: input.status as InviteStatus,
        },
      });
    },
  })
  .mutation("deleteInvite", {
    input: z.object({
      fromUserId: z.string(),
      inviteId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.invite.delete({
        where: { id: input.inviteId },
      });
    },
  });
