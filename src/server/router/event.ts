import { createRouter } from "./context";
import { z } from "zod";

export const eventRouter = createRouter()
  .query("getEventsByUserId", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.event.findMany({
        where: { ownerId: input.userId },
        include: {
          location: true,
          attendees: true,
          images: true,
        },
      });
    },
  })
  .query("getEventById", {
    input: z.object({
      eventId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
        include: {
          location: true,
          attendees: true,
          images: true,
        },
      });
    },
  });
