import type { User } from "@clerk/nextjs/dist/api";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    displayName: user.publicMetadata.displayName as string,
    bio: user.publicMetadata.bio as string,
    location: user.publicMetadata.location as string,
  };
};
