import { z } from "zod";
import { createProtectedRouter } from "./protected-router";
import { nanoid } from "nanoid";

// protected router with queries that can only be hit if the user requesting is signed in
export const connectionRouter = createProtectedRouter()
  .query("getConnectionsByUserId", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.connection.findMany({
        where: { fromUserId: input.id },
      });
    },
  })
  .mutation("createConnection", {
    input: z.object({
      fromUserId: z.string(),
      toUserId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const chatId = "chatroom" + nanoid(10);
      const connectionTo = await ctx.prisma.connection.create({
        data: {
          fromUserId: input.fromUserId,
          toUserId: input.toUserId,
          chatId: chatId,
        },
      });
      const connectionFrom = await ctx.prisma.connection.create({
        data: {
          fromUserId: input.toUserId,
          toUserId: input.fromUserId,
          chatId: chatId,
        },
      });

      return [connectionTo, connectionFrom];
    },
  });
