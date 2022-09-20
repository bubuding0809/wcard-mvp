import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

const BottomNav: React.FC = () => {
  // Get the current route and remove the first slash
  // Use it to determine which bottom nav button should be active
  const { pathname } = useRouter();
  const selected = useMemo(() => pathname.split("/")[1], [pathname]);

  return (
    <div className="btm-nav bg-slate-50 ring-2 ring-slate-200 z-30">
      <Link href="/events">
        <button
          className={`text-primary ${
            selected === "events" && "active -top-0.5"
          }`}
        >
          <HomeIcon className="w-5 md:w-6" />
          <span className="btm-nav-label text-sm text-slate-600">Home</span>
        </button>
      </Link>
      <button
        className={`text-primary ${
          selected === "explore" && "active -top-0.5"
        }`}
      >
        <MagnifyingGlassIcon className="w-5 md:w-6" />
        <span className="btm-nav-label text-sm text-slate-600">Explore</span>
      </button>
      <Link href="/connect">
        <button
          className={`text-primary ${
            selected === "connect" && "active -top-0.5"
          }`}
        >
          <UserPlusIcon className="w-5 md:w-6" />
          <span className="btm-nav-label text-sm text-slate-600">Connect</span>
        </button>
      </Link>
      <button
        className={`text-primary ${
          selected === "activity" && "active -top-0.5"
        }`}
      >
        <BellIcon className="w-5 md:w-6 " />
        <span className="btm-nav-label text-sm text-slate-600">Activity</span>
      </button>
      <Link href="/chat">
        <button
          className={`text-primary ${
            selected === "message" && "active -top-0.5"
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-5 md:w-6" />
          <span className="btm-nav-label text-sm text-slate-600">Message</span>
        </button>
      </Link>
    </div>
  );
};

export default BottomNav;
