"use client"

import { Card, CardContent } from "@chatbotx.io/ui/components/ui/card"
import { cn } from "@chatbotx.io/ui/lib/utils"
import { SiFacebook, SiInstagram } from "@icons-pack/react-simple-icons"
import {
  BotIcon,
  CalendarIcon,
  CardSimIcon,
  CircleQuestionMarkIcon,
  CopyIcon,
  ImagesIcon,
  LinkIcon,
  MapIcon,
  QrCodeIcon,
  SparklesIcon,
  TicketPercentIcon,
  UserCheck2Icon,
  Wand2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useCallback, useMemo } from "react"
import { useWorkspaceId } from "@/hooks/routing"

const TOOLS_CONFIG = [
  {
    id: "ai-functions",
    labelKey: "aiFunctions.title",
    descriptionKey: "aiFunctions.description",
    icon: SparklesIcon,
    getLink: (id: string) => `/space/${id}/ai-functions`,
  },
  {
    id: "facebook-comment",
    labelKey: "facebookCommentAutomation.title",
    descriptionKey: "facebookCommentAutomation.description",
    icon: SiFacebook,
    getLink: (id: string) => `/space/${id}/fb-comments`,
  },
  {
    id: "instagram-comment",
    labelKey: "instagramCommentAutomation.title",
    descriptionKey: "instagramCommentAutomation.description",
    icon: SiInstagram,
    getLink: (id: string) => `/space/${id}/ig-comments`,
  },
  {
    id: "instagram-story",
    labelKey: "instagramStoryAutomation.title",
    descriptionKey: "instagramStoryAutomation.description",
    icon: SiInstagram,
    getLink: (id: string) => `/space/${id}/ig-stories`,
  },
  {
    id: "facebook-lead-ads",
    labelKey: "facebookLeadAdsAutomation.title",
    descriptionKey: "facebookLeadAdsAutomation.description",
    icon: SiFacebook,
    getLink: (id: string) => `/space/${id}/fb-lead-ads`,
  },
  {
    id: "reflinks",
    labelKey: "reflinks.title",
    descriptionKey: "reflinks.description",
    icon: LinkIcon,
    getLink: (id: string) => `/space/${id}/reflinks`,
  },
  {
    id: "magic-links",
    labelKey: "magicLinks.title",
    descriptionKey: "magicLinks.description",
    icon: Wand2Icon,
    getLink: (id: string) => `/space/${id}/magic-links`,
  },
  {
    id: "qr-code",
    labelKey: "qrCodeGenerator.title",
    descriptionKey: "qrCodeGenerator.description",
    icon: QrCodeIcon,
    getLink: (id: string) => `/space/${id}/qr-codes`,
  },
  {
    id: "dynamic-image",
    labelKey: "dynamicImages.title",
    descriptionKey: "dynamicImages.description",
    icon: ImagesIcon,
    getLink: (id: string) => `/space/${id}/dynamic-images`,
  },
  {
    id: "templates",
    labelKey: "templates.title",
    descriptionKey: "templates.description",
    icon: CopyIcon,
    getLink: (id: string) => `/space/${id}/templates`,
  },
  {
    id: "appointment",
    labelKey: "appointmentScheduling.title",
    descriptionKey: "appointmentScheduling.description",
    icon: CalendarIcon,
    getLink: (id: string) => `/space/${id}/appointment-calendars`,
  },
  {
    id: "questionnaires",
    labelKey: "questionnaires.title",
    descriptionKey: "questionnaires.description",
    icon: CircleQuestionMarkIcon,
    getLink: (id: string) => `/space/${id}/questionnaires`,
  },
  {
    id: "ecommerce",
    labelKey: "ecommerce.title",
    descriptionKey: "ecommerce.description",
    icon: CardSimIcon,
    getLink: (id: string) => `/space/${id}/products`,
  },
  {
    id: "places-near-me",
    labelKey: "placesNearMe.title",
    descriptionKey: "placesNearMe.description",
    icon: MapIcon,
  },
  {
    id: "poll-manager",
    labelKey: "pollManager.title",
    descriptionKey: "pollManager.description",
    icon: UserCheck2Icon,
  },
  {
    id: "bot-simulator",
    labelKey: "botSimulator.title",
    descriptionKey: "botSimulator.description",
    icon: BotIcon,
  },
  {
    id: "coupons",
    labelKey: "coupons.title",
    descriptionKey: "coupons.description",
    icon: TicketPercentIcon,
    getLink: (id: string) => `/space/${id}/topic-coupons`,
  },
  // {
  //   id: "webhooks",
  //   labelKey: "webhooks.title",
  //   descriptionKey: "webhooks.description",
  //   icon: UsersIcon,
  //   getLink: (id: string) => `/space/${id}/webhooks`,
  // },
] as const

export const ToolsList = () => {
  const workspaceId = useWorkspaceId()
  const t = useTranslations()
  const router = useRouter()

  const tools = useMemo(
    () =>
      TOOLS_CONFIG.map((config) => ({
        id: config.id,
        label: t(config.labelKey),
        description: t(config.descriptionKey),
        icon: config.icon,
        link:
          "getLink" in config && config.getLink
            ? config.getLink(workspaceId.toString())
            : undefined,
      })),
    [t, workspaceId],
  )

  const handleCardClick = useCallback(
    (link: string | undefined) => {
      if (link) {
        router.push(link)
      }
    },
    [router],
  )

  const handleCardKeyDown = useCallback(
    (link: string | undefined, e: React.KeyboardEvent) => {
      if (!link) {
        return
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        router.push(link)
      }
    },
    [router],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xl">{t("tools.title")}</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            {t("tools.description")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SparklesIcon className="h-5 w-5 animate-pulse text-amber-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">
              AI Function & Workflow Builder
            </h4>
            <p className="text-muted-foreground text-xs">
              Instruct Gemini AI to automatically generate custom tool
              functions, data collection rules, and chatbot workflows.
            </p>
          </div>
        </div>
        <Card
          className="cursor-pointer border-primary/40 bg-primary/10 shadow-none transition-colors hover:bg-primary/20"
          onClick={() => router.push(`/space/${workspaceId}/ai-functions`)}
        >
          <CardContent className="flex items-center gap-2 px-3.5 py-2">
            <SparklesIcon className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-primary text-xs">
              Open AI Builder
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-auto grid-cols-[repeat(auto-fit,minmax(200px,350px))] justify-center gap-4">
        {tools.map((tool) => {
          const isDisabled = !tool.link
          return (
            <Card
              aria-disabled={isDisabled}
              aria-label={tool.link ? tool.label : undefined}
              className={cn(
                tool.link && "cursor-pointer hover:shadow-md",
                isDisabled &&
                  "pointer-events-none cursor-not-allowed opacity-60 grayscale",
              )}
              key={tool.id}
              onClick={() => handleCardClick(tool.link)}
              onKeyDown={(e) => handleCardKeyDown(tool.link, e)}
              role={tool.link ? "button" : undefined}
              tabIndex={tool.link ? 0 : undefined}
            >
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-center">
                  <tool.icon className="text-primary" size={30} />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{tool.label}</h3>
                  <p className="text-muted-foreground text-sm">
                    {tool.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
