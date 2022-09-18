// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { userRouter } from "./user";
import { eventRouter } from "./event";
import { inviteRouter } from "./invite";
import { protectedExampleRouter } from "./protected-example-router";
import { connectionRouter } from "./connection";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("event.", eventRouter)
  .merge("auth.", protectedExampleRouter)
  .merge("invite.", inviteRouter)
  .merge("connection.", connectionRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
