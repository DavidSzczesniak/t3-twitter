import { type AppType } from "next/app";

import { api } from "~/utils/api";
import { ClerkProvider, SignIn, SignInButton, useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/clerk-react";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { useRouter } from "next/router";
import { BsArrowLeftShort } from "react-icons/bs";
import Image from "next/image";
import { Popover } from "@mantine/core";
import { useState } from "react";
import { useClickOutside } from "@mantine/hooks";
import Link from "next/link";

const UserInfo = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => setOpened(false));

  if (!user || !user.username) return null;

  return (
    <Popover
      opened={opened}
      width={200}
      position="bottom"
      withArrow
      shadow="md"
    >
      <Popover.Target>
        <div
          className="flex cursor-pointer items-center justify-between gap-4 rounded-full transition hover:bg-slate-800"
          onClick={() => setOpened(!opened)}
        >
          <span className="text-md ml-4 font-bold">{user.username}</span>
          <Image
            src={user.profileImageUrl}
            alt="Profile image"
            className="h-10 w-10 rounded-full"
            width={40}
            height={40}
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown className="border-slate-400 bg-black p-0 py-2">
        <ol ref={ref} onClick={() => setOpened(false)}>
          <li
            onClick={() => signOut()}
            className="cursor-pointer p-2 transition hover:bg-slate-600"
          >
            Sign out
          </li>
          <Link href={`/@${user.username}`}>
            <li className="cursor-pointer p-2 transition hover:bg-slate-600">
              Profile
            </li>
          </Link>
        </ol>
      </Popover.Dropdown>
    </Popover>
  );
};

const Navigation = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();

  return (
    <nav className="flex justify-center">
      <div className="flex w-full items-center justify-between border-x border-slate-400 p-4 align-middle md:max-w-2xl">
        {router.pathname === "/" ? (
          <span className="text-lg font-bold">Home</span>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full transition hover:bg-slate-800"
          >
            <BsArrowLeftShort size="2.25rem" />
          </button>
        )}
        <UserInfo />
        {!isSignedIn && <SignInButton />}
      </div>
    </nav>
  );
};

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>t3-twitter</title>
        <meta name="description" content="🤨" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
