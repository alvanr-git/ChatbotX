import { db } from "@chatbotx.io/database/client"
import {
  IntegrationJobAction,
  integrationQueue,
} from "@chatbotx.io/worker-config"
import { logger } from "../../lib/logger"

interface MediaItem {
  id: string
  caption?: string
  media_type: string
  timestamp: string
}

interface CommentItem {
  id: string
  text: string
  timestamp: string
  from?: {
    id: string
    username: string
  }
  parent_id?: string
}

interface MediaResponse {
  data?: MediaItem[]
}

interface CommentsResponse {
  data?: CommentItem[]
}

export const pollInstagramComments = async (): Promise<void> => {
  try {
    const integrations = await db.query.integrationInstagramModel.findMany({
      where: (fields, { eq }) => eq(fields.isConnected, true),
    })

    if (!integrations.length) {
      return
    }

    for (const integration of integrations) {
      try {
        const accessToken = integration.auth?.tokens?.accessToken
        const igId = integration.igId
        if (!accessToken || !igId) continue

        const version = integration.auth?.metadata?.version ?? "v26.0"
        const mediaUrl = `https://graph.facebook.com/${version}/${igId}/media?fields=id,caption,media_type,timestamp&limit=15&access_token=${accessToken}`

        const mediaRes = await fetch(mediaUrl)
        if (!mediaRes.ok) continue
        const mediaData = (await mediaRes.json()) as MediaResponse
        const mediaItems = mediaData.data ?? []

        for (const media of mediaItems) {
          const commentsUrl = `https://graph.facebook.com/${version}/${media.id}/comments?fields=id,text,timestamp,from,parent_id&limit=25&access_token=${accessToken}`
          const commentsRes = await fetch(commentsUrl)
          if (!commentsRes.ok) continue
          const commentsData = (await commentsRes.json()) as CommentsResponse
          const comments = commentsData.data ?? []

          if (comments.length > 0) {
            logger.info(
              { count: comments.length, mediaId: media.id },
              "[PollInstagramComments] Discovered comments on media",
            )
          }

          for (const comment of comments) {
            if (!comment.id || !comment.text) continue

            const commentCreatedTime = Math.floor(
              new Date(comment.timestamp || Date.now()).getTime() / 1000,
            )

            await integrationQueue.add(
              IntegrationJobAction.incomingComment,
              {
                type: IntegrationJobAction.incomingComment,
                data: {
                  integrationType: "instagramFacebook",
                  integrationIdentifier: integration.igId,
                  commentData: {
                    commentId: comment.id,
                    postId: media.id,
                    parentId: comment.parent_id,
                    fromId: comment.from?.id ?? comment.id,
                    fromName: comment.from?.username ?? "instagram_user",
                    message: comment.text,
                    createdTime: commentCreatedTime,
                  },
                },
              },
              {
                jobId: `comment-incoming-${comment.id}`,
              },
            )
          }
        }
      } catch (err) {
        logger.error(
          { err, integrationId: integration.id },
          "[PollInstagramComments] Failed to poll integration",
        )
      }
    }
  } catch (err) {
    logger.error({ err }, "[PollInstagramComments] Failed to poll comments")
  }
}
