/* This example requires Tailwind CSS v2.0+ */
import { Dispatch, Fragment, SetStateAction } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

type SlideOverProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const SlideOver: React.FC<SlideOverProps> = ({ open, setOpen }) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  console.log(open);
  const getGreetings = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-30"
        onClose={() => setTimeout(() => setOpen(false), 10)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-32 md:pl-20 lg:10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className=" text-gray-900">
                        {session?.user && (
                          <div className="flex justify-start items-end gap-3">
                            {session?.user?.image && (
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
                              <small className="text-sm font-medium">
                                {getGreetings()}
                              </small>
                              <h1 className="text-xl font-bold justify-between">
                                {session.user.name}
                              </h1>
                            </div>
                          </div>
                        )}
                      </Dialog.Title>
                    </div>

                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {/* Replace with your content */}
                      <div className="absolute inset-0 px-4 sm:px-6">
                        <div
                          className="h-full border-2 border-dashed border-gray-200 p-2"
                          aria-hidden="true"
                        >
                          <div>
                            {loading && (
                              <h1 className="text-2xl text-center">
                                Loading...
                              </h1>
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
                          <button
                            className="btn btn-md"
                            onClick={e => {
                              signOut({
                                callbackUrl: "/",
                              });
                            }}
                          >
                            <p className="text-xs">Sign out</p>
                          </button>
                        </div>
                      </div>
                      {/* /End replace */}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SlideOver;
