import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

// protected router with queries that can only be hit if the user requesting is signed in
export const messageRouter = createProtectedRouter()
  .query("getMessagesByConnectionChatId", {
    input: z.object({ chatId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.message.findMany({
        where: {
          connection: {
            chatId: input.chatId,
          },
        },
        include: {
          fromUser: {
            select: {
              name: true,
              image: true,
            },
          },
          toUser: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    },
  })
  .mutation("createMessage", {
    input: z.object({
      chatId: z.string(),
      connectionId: z.string(),
      fromUserId: z.string(),
      toUserId: z.string(),
      text: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.message.create({
        data: {
          connection: {
            connect: {
              id: input.connectionId,
            },
          },
          fromUser: {
            connect: {
              id: input.fromUserId,
            },
          },
          toUser: {
            connect: {
              id: input.toUserId,
            },
          },
          text: input.text,
        },
      });
    },
  });
