// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";
import Pusher from "pusher";

export const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { channel, event, data } = req.body;
  const response = await pusher.trigger(channel, event, data);
  if (event === "message-alert-event") {
    console.log("message-alert-event", channel);
  }
  res.status(200).json(response);
};
