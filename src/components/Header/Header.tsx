import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./Header.module.css";

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <header className="w-fit sticky top-0 ml-auto mr-auto">
      <div className="bg-slate-500/50 border-slate-600 border-x-2 border-b-2 rounded-b-xl p-3 shadow-primary">
        {session?.user && (
          <div className="flex justify-between gap-2">
            {session.user.image && (
              <span
                style={{ backgroundImage: `url('${session.user.image}')` }}
                className={styles.avatar}
              />
            )}
            <div className="flex flex-col">
              <small>Signed in as</small>
              <strong>{session.user.email ?? session.user.name}</strong>
            </div>
            <a
              href={`/api/auth/signout`}
              className="btn"
              onClick={e => {
                e.preventDefault();
                signOut({
                  callbackUrl: "/",
                });
              }}
            >
              Sign out
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
