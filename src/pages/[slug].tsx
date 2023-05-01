import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/serverHelper";
import { Modal } from "@mantine/core";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface EditModalProps {
  opened: boolean;
  onClose: () => void;
}

const EditModal = ({ opened, onClose }: EditModalProps) => {
  return (
    <Modal opened={opened} onClose={onClose} radius="lg" title="Edit Profile">
      test
    </Modal>
  );
};

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0)
    return <div className="text-2xl font-bold">No posts yet</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });
  const { user: loggedInUser } = useUser();

  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <EditModal
          opened={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="flex h-[64px] items-center justify-end px-4">
          {loggedInUser?.id === data.id && (
            <button
              type="button"
              className="h-fit rounded-full border border-slate-400 p-2 px-4 font-bold transition hover:bg-slate-800"
              onClick={() => setEditModalOpen(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? ""
        }`}</div>
        <div className="w-full border-b border-slate-400"></div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return { props: { trpcState: helpers.dehydrate(), username } };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
