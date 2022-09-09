import { Event, Location } from "@prisma/client";
import React from "react";
import Image from "next/image";
import { MapPinMini } from "../Icons";

type EventCardProps = {
  event: Event & {
    location: Location;
  };
};

const myLoader = ({ src, width }: { src: string; width: number }) => {
  return `https://${src}/${width}/${width}`;
};

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div
      key={event.id}
      className="card card-side bg-base-100 shadow-xl cursor-pointer"
    >
      <Image
        loader={myLoader}
        src="picsum.photos"
        width={150}
        height={250}
        alt="Event picture"
        className="object-cover rounded-l-xl"
        layout="fixed"
      />
      <div className="card-body p-4 w-52">
        <h2 className="card-title">{event.title}</h2>
        <p className="h-10 line-clamp-4">{event.description}</p>
        <div className="flex flex-col gap-2">
          <p className=" text-xs text-gray-500">{event.date.toUTCString()}</p>
          <div className="badge badge-outline border-2 pl-1 pr-2 h-8 w-full">
            <MapPinMini />
            <p className="text-xs truncate">{event.location.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
