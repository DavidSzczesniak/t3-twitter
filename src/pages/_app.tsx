import { type AppType } from "next/app";

import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { useRouter } from "next/router";
import { BsArrowLeftShort } from "react-icons/bs";

const Navigation = () => {
  const router = useRouter();
  console.log("router", router);
  return (
    <nav className="flex justify-center">
      <div className="flex w-full border-x border-slate-400 p-4 align-middle md:max-w-2xl">
        {router.pathname === "/" ? (
          <span className="text-lg font-bold">Home</span>
        ) : (
          <button type="button" onClick={() => router.back()}>
            <BsArrowLeftShort size="2.25rem" />
          </button>
        )}
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
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
