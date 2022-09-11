import { signOut, useSession } from "next-auth/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();

  return (
    <header className="w-fit top-0 ml-auto mr-auto z-30">
      <button className="absolute btn left-0 m-2" onClick={() => router.back()}>
        <ArrowLeftIcon className="h-5 w-5 text-white" />
      </button>
      <div className="bg-slate-500/50 border-slate-600 border-x-2 border-b-2 rounded-b-xl p-3 shadow-primary">
        {loading && <h1 className="text-2xl text-center">Loading...</h1>}
        {session?.user && (
          <div className="flex justify-between gap-3">
            {session.user.image && (
              <div className="avatar cursor-pointer">
                <div className="w-12 rounded-full ring ring-primary ring-offset-2 base-100 ">
                  <img
                    src={`${session.user.image}`}
                    alt={`${session.user.name}`}
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col">
              <small>Signed in as</small>
              <strong>{session.user.name}</strong>
            </div>
            <a
              href={`/api/auth/signout`}
              className="btn btn-md"
              onClick={e => {
                e.preventDefault();
                signOut({
                  callbackUrl: "/",
                });
              }}
            >
              <p className="text-xs">Sign out</p>
            </a>
          </div>
        )}
        {!session && (
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold">{status}</p>
            <Link href="/auth/signin">
              <button className="btn">Sign in</button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
