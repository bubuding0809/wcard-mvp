import type { NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import React from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { User } from "@prisma/client";
import Link from "next/link";

import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Footer from "../components/Footer";

const navigation = [
  { name: "Explore", href: "/events" },
  { name: "Connect", href: "/connect" },
  { name: "Friends", href: "#" },
  { name: "About", href: "#" },
];

const LandingPage: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>WCard Connect</title>
        <meta name="description" content="WCard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 bg-white pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
            <svg
              className="absolute inset-y-0 right-0 hidden h-full w-48 translate-x-1/2 transform text-white lg:block"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <Popover>
              <div className="sticky px-4 pt-6 sm:px-6 lg:px-8">
                <nav
                  className="relative flex items-center justify-between sm:h-10 lg:justify-start"
                  aria-label="Global"
                >
                  <div className="flex flex-shrink-0 flex-grow items-center lg:flex-grow-0">
                    <div className="flex w-full items-center justify-between md:w-auto">
                      <Link href="/">
                        <a className="flex items-end sm:items-center">
                          <span className="sr-only">WCard</span>
                          <img
                            alt="WCard"
                            className="h-8 w-auto sm:h-10"
                            src="/BlueLogo.png"
                          />
                          <p className="text-xl sm:text-3xl font-bold">Card</p>
                        </a>
                      </Link>

                      <div className="-mr-2 flex items-center md:hidden">
                        <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                          <span className="sr-only">Open main menu</span>
                          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </Popover.Button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:ml-10 md:flex md:space-x-8 md:pr-4 md:items-center">
                    {navigation.map(item => (
                      <Link key={item.name} href={item.href}>
                        <a
                          key={item.name}
                          className="font-medium text-gray-500 hover:text-gray-900"
                        >
                          {item.name}
                        </a>
                      </Link>
                    ))}
                    {session ? (
                      <div className="avatar cursor-pointer">
                        <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={session!.user!.image!}
                            alt={`${session.user?.name} image`}
                          />
                        </div>
                      </div>
                    ) : (
                      <Link href="/api/auth/signin">
                        <a className="font-medium text-indigo-600 hover:text-indigo-500">
                          Log in
                        </a>
                      </Link>
                    )}
                  </div>
                </nav>
              </div>

              <Transition
                as={Fragment}
                enter="duration-150 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-100 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Popover.Panel
                  focus
                  className="absolute inset-x-0 top-0 z-10 origin-top-right transform p-2 transition md:hidden"
                >
                  <div className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black ring-opacity-5">
                    <div className="flex items-center justify-between px-5 pt-4">
                      <div>
                        {session ? (
                          <div className="avatar cursor-pointer">
                            <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                              <img
                                src={session!.user!.image!}
                                alt={`${session.user?.name} image`}
                              />
                            </div>
                          </div>
                        ) : (
                          <img
                            className="h-8 w-auto"
                            src="/BlueLogo.png"
                            alt="WCard logo"
                          />
                        )}
                      </div>
                      <div className="-mr-2">
                        <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                          <span className="sr-only">Close main menu</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </Popover.Button>
                      </div>
                    </div>
                    <div className="space-y-1 px-2 pt-2 pb-3">
                      {navigation.map(item => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                    {session ? (
                      <Link href="/api/auth/signout">
                        <a
                          className="block w-full bg-gray-50 px-5 py-3 text-center font-medium text-indigo-600 hover:bg-gray-100"
                          onClick={e => {
                            e.preventDefault();
                            signOut({
                              callbackUrl: "/",
                            });
                          }}
                        >
                          Log out
                        </a>
                      </Link>
                    ) : (
                      <Link href="/api/auth/signin">
                        <a className="block w-full bg-gray-50 px-5 py-3 text-center font-medium text-indigo-600 hover:bg-gray-100">
                          Log in
                        </a>
                      </Link>
                    )}
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>

            <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Connectivity with a</span>{" "}
                  <span className="block text-primary xl:inline">
                    single tap
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                  Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure
                  qui lorem cupidatat commodo. Elit sunt amet fugiat veniam
                  occaecat fugiat aliqua.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/events">
                      <a className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg">
                        Get started
                      </a>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="https://www.thisworldthesedays.com/wcard---learn-more.html"
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-content/40 px-8 py-3 text-base font-medium text-primary hover:bg-indigo-200 md:py-4 md:px-10 md:text-lg"
                    >
                      Live demo
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover object-bottom sm:h-72 md:h-96 lg:h-full lg:w-full"
            src="/Landing_1.jpg"
            alt="Landing image"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  return {
    props: {
      session,
    },
  };
};
export default LandingPage;
