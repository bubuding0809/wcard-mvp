import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

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
      const connectionTo = await ctx.prisma.connection.create({
        data: {
          fromUserId: input.fromUserId,
          toUserId: input.toUserId,
        },
      });
      const connectionFrom = await ctx.prisma.connection.create({
        data: {
          fromUserId: input.toUserId,
          toUserId: input.fromUserId,
        },
      });

      return [connectionTo, connectionFrom];
    },
  });
