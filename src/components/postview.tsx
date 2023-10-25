import { type RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

interface PostContentProps {
  data: PostWithUser;
  isPostPage?: boolean;
}

const PostContent = ({ data, isPostPage = false }: PostContentProps) => {
  const { post, author } = data;

  return (
    <div
      key={post.id}
      className={`flex gap-3 border-b border-slate-400 p-4 ${
        !isPostPage ? "transition hover:bg-slate-800" : ""
      }`}
    >
      <Link href={`/@${author.username}`}>
        <Image
          src={author.profileImageUrl}
          alt={`@${author.username}'s profile picture`}
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <Link href={`/@${author.username}`}>
            <span className="mr-2">{author.displayName}</span>
            <span className="text-slate-400">{`@${author.username}`}</span>
          </Link>
          <span className="px-2 text-slate-400">·</span>
          <Link href={`/post/${post.id}`}>
            <span className="text-slate-400">
              {dayjs(post.createdAt).fromNow()}
            </span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

export const PostView = (props: PostWithUser) => {
  const router = useRouter();
  const isPostPage = router.pathname === "/post/[id]";

  if (isPostPage) {
    return <PostContent data={props} isPostPage />;
  }

  return (
    <Link href={`/post/${props.post.id}`}>
      <PostContent data={props} />
    </Link>
  );
};
