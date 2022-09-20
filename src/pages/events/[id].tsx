import { GetServerSideProps, NextPage } from "next";
import { Event, Location, User, Image } from "@prisma/client";
import NextImage from "next/image";
import { prisma } from "../../server/db/client";
import Head from "next/head";
import { CalendarMini, MapPinMini } from "../../components/Icons";
import { trpc } from "../../utils/trpc";

type EventPageProps = {
  event?: Event & {
    location: Location;
    attendees: User[];
    owner: User;
    images: Image[];
  };
  error?: string;
};

const myLoader = ({ src, width }: { src: string; width: number }) => {
  return `https://${src}/${width}/${width}`;
};

const EventPage: NextPage<EventPageProps> = ({ event, error }) => {
  if (error) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-center">Events</h1>
        <div>
          <h1 className="text-2xl text-center">{error}</h1>
        </div>
      </div>
    );
  }

  const { data: eventData } = trpc.useQuery(
    ["event.getEventById", { eventId: event!.id }],
    {
      initialData: event,
    }
  );

  return (
    <>
      <Head>
        <title>Event</title>
        <meta name="description" content="WCard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center gap-4 mt-4 p-4">
        <div className="flex flex-col gap-4 items-center max-w-lg">
          <h1 className="text-4xl font-bold text-center">{eventData?.title}</h1>
          <NextImage
            loader={myLoader}
            src="picsum.photos"
            width={512}
            height={250}
            alt="Event picture"
            className="object-cover rounded-xl"
            layout="fixed"
          />
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">{eventData?.description}</p>
            <div className="flex gap-2">
              <div className="badge badge-outline border-2 pl-1 pr-2 h-8">
                <MapPinMini />
                <p className="text-xs truncate">{eventData?.location.name}</p>
              </div>
              <div className="badge badge-outline border-2 pl-1 pr-2 h-8">
                <CalendarMini />
                <p className="text-xs truncate">
                  {new Date(eventData!.date).toUTCString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex rounded-3xl w-full bg-slate-200 p-1">
            <div className="avatar-group -space-x-5 p-2">
              {eventData?.attendees.map(attendee => {
                return (
                  <div
                    key={attendee.id}
                    className="avatar hover:scale-110 transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-16 mask mask-squircle">
                      <img src={`${attendee.image}`} alt={`${attendee.name}`} />
                    </div>
                  </div>
                );
              })}
              <div className="avatar placeholder">
                <div className="w-16 bg-neutral-focus text-neutral-content">
                  <span>+99</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EventPage;

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: ctx.params?.id as string,
      },
      include: {
        location: true,
        attendees: true,
        owner: true,
        images: true,
      },
    });

    if (!event) throw new Error("4040 Event not found");

    return {
      props: {
        event: JSON.parse(JSON.stringify(event)),
      },
    };
  } catch (err: any) {
    return {
      props: {
        error: err.message,
      },
    };
  }
};
