import {
  platformCredentialService,
  workspaceService,
} from "@chatbotx.io/business"
import type { ChannelType } from "@chatbotx.io/database/partials"
import { getIdFromParams } from "@chatbotx.io/utils"
import { notFound, redirect } from "next/navigation"
import InboxSelectCard from "@/features/inboxes/components/inbox-select-card"
import { InstagramLoginSelect } from "@/features/integration-instagram/components/instagram-login-select"
import { generateInstagramRedirectUri } from "@/features/integration-instagram/libs/oauth"
import { generateInstagramFacebookRedirectUri } from "@/features/integration-instagram/libs/oauth-facebook"
import { generateMessengerRedirectUri } from "@/features/integration-messenger/libs/oauth"
import { TelegramConnect } from "@/features/integration-telegram/components/telegram-connect"
import { generateTiktokRedirectUri } from "@/features/integration-tiktok/libs/tiktok"
import { SimpleCreateWebchat } from "@/features/integration-webchat/simple-create-webchat"
import WhatsappCreate from "@/features/integration-whatsapp/components/whatsapp-create"
import { generateZaloRedirectUri } from "@/features/integration-zalo/libs/zalo"
import { requireWorkspacePermission } from "@/lib/auth/require-workspace-permission"
import { getCurrentUserId } from "@/lib/auth/utils"

export const dynamic = "force-dynamic"

type CreateChannelPageProps = {
  searchParams: Promise<{
    channel?: string | null
    workspaceId?: string | null
  }>
}

export default async function CreateChannelPage(props: CreateChannelPageProps) {
  const searchParams = await props.searchParams
  const workspaceId = getIdFromParams(searchParams, "workspaceId")

  if (workspaceId) {
    await requireWorkspacePermission(workspaceId, "superAdmin")
  }

  const selectedChannel = searchParams.channel

  if (selectedChannel === "telegram") {
    return <TelegramConnect autoOpen={true} workspaceId={workspaceId} />
  }

  if (selectedChannel === "webchat") {
    return <SimpleCreateWebchat workspaceId={workspaceId} />
  }

  const userId = await getCurrentUserId()
  if (!userId) {
    return notFound()
  }

  const platformOwnerId = workspaceId
    ? ((await workspaceService.find({ where: { id: workspaceId } }))?.ownerId ??
      userId)
    : userId

  const [whatsapp, messenger, instagram, instagramFacebook, zalo, tiktok] =
    await Promise.all([
      platformCredentialService.resolvePublicForUser({
        userId: platformOwnerId,
        type: "whatsapp",
      }),
      platformCredentialService.resolvePublicForUser({
        userId: platformOwnerId,
        type: "messenger",
      }),
      platformCredentialService.resolvePublicForUser({
        userId: platformOwnerId,
        type: "instagram",
      }),
      platformCredentialService.resolvePublicForUser({
        userId: platformOwnerId,
        type: "instagramFacebook",
      }),
      platformCredentialService.resolvePublicForUser({
        userId: platformOwnerId,
        type: "zalo",
      }),
      platformCredentialService.resolvePublicForUser({
        userId: platformOwnerId,
        type: "tiktok",
      }),
    ])

  if (selectedChannel === "whatsapp" && whatsapp) {
    return (
      <WhatsappCreate
        settings={whatsapp.publicConfig}
        workspaceId={workspaceId}
      />
    )
  }

  if (selectedChannel === "messenger" && messenger) {
    const redirectUri = await generateMessengerRedirectUri(
      messenger.publicConfig,
      workspaceId,
    )
    redirect(redirectUri)
  }

  if (selectedChannel === "instagram") {
    if (instagram && instagramFacebook) {
      return <InstagramLoginSelect workspaceId={workspaceId} />
    }
    if (instagramFacebook) {
      const redirectUri = await generateInstagramFacebookRedirectUri(
        instagramFacebook.publicConfig,
        workspaceId,
      )
      redirect(redirectUri)
    }
    if (instagram) {
      const redirectUri = await generateInstagramRedirectUri(
        instagram.publicConfig,
        workspaceId,
      )
      redirect(redirectUri)
    }
    return <InstagramLoginSelect workspaceId={workspaceId} />
  }

  if (selectedChannel === "instagram-direct" && instagram) {
    const redirectUri = await generateInstagramRedirectUri(
      instagram.publicConfig,
      workspaceId,
    )
    redirect(redirectUri)
  }

  if (selectedChannel === "instagram-facebook" && instagramFacebook) {
    const redirectUri = await generateInstagramFacebookRedirectUri(
      instagramFacebook.publicConfig,
      workspaceId,
    )
    redirect(redirectUri)
  }

  if (selectedChannel === "zalo" && zalo) {
    const redirectUri = await generateZaloRedirectUri(
      zalo.publicConfig,
      workspaceId,
    )
    redirect(redirectUri)
  }

  if (selectedChannel === "tiktok" && tiktok) {
    const redirectUri = await generateTiktokRedirectUri(
      tiktok.publicConfig,
      workspaceId,
    )
    redirect(redirectUri)
  }

  const configuredChannels: ChannelType[] = []
  if (whatsapp) {
    configuredChannels.push("whatsapp")
  }
  if (messenger) {
    configuredChannels.push("messenger")
  }
  if (instagram || instagramFacebook) {
    configuredChannels.push("instagram")
  }
  if (zalo) {
    configuredChannels.push("zalo")
  }
  if (tiktok) {
    configuredChannels.push("tiktok")
  }

  return <InboxSelectCard configuredChannels={configuredChannels} />
}
