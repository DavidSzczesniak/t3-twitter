import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/serverHelper";
import { Modal, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/router";

interface EditModalProps {
  opened: boolean;
  onClose: () => void;
}

type Inputs = {
  displayName: string;
};

const EditModal = ({ opened, onClose }: EditModalProps) => {
  const { handleSubmit, control, setValue } = useForm<Inputs>({
    defaultValues: { displayName: "" },
  });

  const { user } = useUser();
  useEffect(() => {
    // not the best, will do for now
    if (user)
      setValue("displayName", user.publicMetadata.displayName as string);
  }, [user, setValue]);

  const { mutate } = api.profile.updateDisplayName.useMutation();

  const router = useRouter();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutate({ ...data });
    router.reload();
  };

  return (
    <Modal opened={opened} onClose={onClose} radius="lg" title="Edit Profile">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, value, name } }) => (
            <TextInput
              onChange={onChange}
              value={value}
              name={name}
              label="Display Name"
            />
          )}
        />
        <div className="flex w-full justify-end pt-4">
          <button
            type="submit"
            className="h-fit rounded-full border border-slate-400 p-2 px-4 font-bold transition hover:bg-slate-800"
          >
            Save
          </button>
        </div>
      </form>
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

  const displayName = data.displayName || data.username;

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
        <div className="px-4 pt-4 text-2xl font-bold">{displayName}</div>
        <div className="px-4 pb-4 text-slate-400">{`@${
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
