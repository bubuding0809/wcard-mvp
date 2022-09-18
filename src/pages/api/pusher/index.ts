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

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
  const { message, sender, createdAt } = req.body;
  const response = await pusher.trigger("chat", "message-event", {
    message,
    sender,
    createdAt,
  });

  res.status(200).json(response);
};

export default examples;
