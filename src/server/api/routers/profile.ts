import { clerkClient } from "@clerk/nextjs/dist/api";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      return filterUserForClient(user);
    }),
  updateDisplayName: privateProcedure
    .input(z.object({ displayName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await clerkClient.users.updateUser(ctx.userId, {
        publicMetadata: { displayName: input.displayName },
      });

      return {
        success: true,
        message: "successfully updated user display name",
      };
    }),
});
