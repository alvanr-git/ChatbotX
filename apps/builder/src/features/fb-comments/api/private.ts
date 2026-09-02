import { messengerIntegrationService } from "@chatbotx.io/business"
import {
  type FacebookPostListItem,
  listAdsPosts,
  listPublishedPosts,
  listReelsPosts,
} from "@chatbotx.io/integration-messenger/apis/post"
import type { MessengerAuthValue } from "@chatbotx.io/integration-messenger/schema"
import { zodBigintAsString } from "@chatbotx.io/utils"
import z from "zod"
import { listInstagramFacebookMedia } from "@/features/ig-comments/queries/instagram-media"
import { withWorkspaceIdSchema } from "@/features/workspaces/schema/resource"
import { collectSettled } from "@/lib/collect-settled"
import { workspaceAuthorizedMidddleware } from "@/middlewares/auth"
import { authorizedAPI } from "@/orpc"
import { createFbComment } from "../actions/create-fb-comment.action"
import { deleteFbComment } from "../actions/delete-fb-comment.action"
import { updateFbComment } from "../actions/update-fb-comment.action"
import { listFbComments } from "../queries"
import {
  createFbCommentRequest,
  listFbCommentsRequest,
  listFbCommentsResponse,
  updateFbCommentRequest,
} from "../schema/action"
import { fbCommentResource } from "../schema/resource"

const facebookPostSchema = z.object({
  id: z.string(),
  message: z.string().optional(),
  full_picture: z.string().optional(),
  created_time: z.string(),
  permalink_url: z.string().optional(),
  pageId: z.string(),
})

export const fbCommentsPrivateAPI = {
  listFbCommentsAPI: authorizedAPI
    .route({
      method: "GET",
      path: "/workspaces/{workspaceId}/fb-comments",
      summary: "List FB Comment Automations",
      tags: ["FB Comments"],
    })
    .input(listFbCommentsRequest)
    .use(workspaceAuthorizedMidddleware, (input) => input.workspaceId)
    .output(listFbCommentsResponse)
    .handler(async ({ input }) => await listFbComments(input)),

  createFbCommentAPI: authorizedAPI
    .route({
      method: "POST",
      path: "/workspaces/{workspaceId}/fb-comments",
      summary: "Create FB Comment Automation",
      tags: ["FB Comments"],
    })
    .input(createFbCommentRequest.and(withWorkspaceIdSchema))
    .use(workspaceAuthorizedMidddleware, (input) => input.workspaceId)
    .output(fbCommentResource)
    .handler(async ({ input }) => {
      const { workspaceId, ...rest } = input
      return await createFbComment(workspaceId, rest)
    }),

  updateFbCommentAPI: authorizedAPI
    .route({
      method: "PUT",
      path: "/workspaces/{workspaceId}/fb-comments/{id}",
      summary: "Update FB Comment Automation",
      tags: ["FB Comments"],
    })
    .input(
      updateFbCommentRequest
        .and(withWorkspaceIdSchema)
        .and(z.object({ id: zodBigintAsString() })),
    )
    .use(workspaceAuthorizedMidddleware, (input) => input.workspaceId)
    .output(fbCommentResource)
    .handler(async ({ input }) => {
      const { workspaceId, id, ...rest } = input
      return await updateFbComment({ workspaceId, id }, rest)
    }),

  deleteFbCommentAPI: authorizedAPI
    .route({
      method: "DELETE",
      path: "/workspaces/{workspaceId}/fb-comments/{id}",
      summary: "Delete FB Comment Automation",
      tags: ["FB Comments"],
    })
    .input(withWorkspaceIdSchema.and(z.object({ id: zodBigintAsString() })))
    .use(workspaceAuthorizedMidddleware, (input) => input.workspaceId)
    .output(z.void())
    .handler(async ({ input }) => {
      await deleteFbComment({ workspaceId: input.workspaceId, id: input.id })
    }),

  facebookPostsAPI: authorizedAPI
    .route({
      method: "GET",
      path: "/workspaces/{workspaceId}/fb-comments/facebook-posts",
      summary: "List Facebook posts for FB Comment Automation",
      tags: ["FB Comments"],
    })
    .input(withWorkspaceIdSchema)
    .use(workspaceAuthorizedMidddleware, (input) => input.workspaceId)
    .output(
      z.object({
        published: z.array(facebookPostSchema),
        ads: z.array(facebookPostSchema),
        reels: z.array(facebookPostSchema),
        pages: z.array(z.object({ id: z.string(), name: z.string() })),
      }),
    )
    .handler(async ({ input }) => {
      const integrations = await messengerIntegrationService.findByWorkspaceId(
        input.workspaceId,
      )

      if (integrations.length === 0) {
        const { posts: igPosts, pages: igPages } =
          await listInstagramFacebookMedia(input.workspaceId)
        const published = igPosts
          .filter(
            (p) =>
              p.media_product_type?.toUpperCase() !== "REELS" &&
              p.media_product_type?.toUpperCase() !== "CLIPS" &&
              p.media_type?.toUpperCase() !== "VIDEO",
          )
          .map((p) => ({
            id: p.id,
            message: p.message,
            full_picture: p.full_picture,
            created_time: p.created_time,
            permalink_url: p.permalink_url,
            pageId: p.accountId,
          }))
        const reels = igPosts
          .filter(
            (p) =>
              p.media_product_type?.toUpperCase() === "REELS" ||
              p.media_product_type?.toUpperCase() === "CLIPS" ||
              p.media_type?.toUpperCase() === "VIDEO",
          )
          .map((p) => ({
            id: p.id,
            message: p.message,
            full_picture: p.full_picture,
            created_time: p.created_time,
            permalink_url: p.permalink_url,
            pageId: p.accountId,
          }))
        return { published, ads: [], reels, pages: igPages }
      }

      const pages = integrations.map((integration) => ({
        id: integration.pageId,
        name: integration.name,
      }))

      const fetchByType = (type: "published" | "ads" | "reels") =>
        collectSettled(
          integrations,
          async (integration) => {
            const auth = integration.auth as MessengerAuthValue
            const pageId = integration.pageId

            let posts: FacebookPostListItem[]
            if (type === "published") {
              posts = await listPublishedPosts({ auth, pageId })
            } else if (type === "ads") {
              posts = await listAdsPosts({ auth, pageId })
            } else {
              posts = await listReelsPosts({ auth, pageId })
            }
            return posts.map((post) => ({ ...post, pageId }))
          },
          (integration) => ({ integrationId: integration.id }),
          `Failed to list Facebook ${type} posts for an integration`,
        )

      const [published, ads, reels] = await Promise.all([
        fetchByType("published"),
        fetchByType("ads"),
        fetchByType("reels"),
      ])

      return { published, ads, reels, pages }
    }),
}
