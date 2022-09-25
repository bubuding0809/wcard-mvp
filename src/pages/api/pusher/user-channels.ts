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
  try {
    const response = await pusher.get({ path: "/channels" });
    if (response.status === 200) {
      const body = await response.json();
      const channelsInfo = body.channels;
      const userChannelsMap: {
        [key: string]: string;
      } = {};

      for (const channel of Object.keys(channelsInfo)) {
        if (channel.startsWith("private-user")) {
          const user = channel.split("-").pop();
          userChannelsMap[user!] = "online";
        }
      }

      return res.status(200).json(userChannelsMap);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};
