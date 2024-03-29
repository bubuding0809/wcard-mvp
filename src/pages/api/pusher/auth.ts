// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";
import Pusher from "pusher";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const socketId = req.body.socket_id;
  const userId = req.body.userId;
  const channelId = req.body.channel_name;
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (session.user?.id !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const presenceData = {
    user_id: session.user!.id!,
    user_info: {
      name: session.user!.name,
      email: session.user!.email,
      image: session.user!.image,
    },
  };

  const authResponse = pusher.authorizeChannel(
    socketId,
    channelId,
    presenceData
  );

  res.send(authResponse);
};
