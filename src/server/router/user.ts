import { createRouter } from "./context";
import { z } from "zod";

export const userRouter = createRouter()
  .query("getUserById", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });
    },
  })
  .query("getUserByEmail", {
    input: z.object({
      email: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
    },
  });
