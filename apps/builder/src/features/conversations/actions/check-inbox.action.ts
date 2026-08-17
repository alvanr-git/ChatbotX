"use server"

import { ScheduleJobData, scheduleQueue } from "@chatbotx.io/worker-config"
import {
  type WorkspaceIdRequestParams,
  workspaceIdrequestParams,
} from "@/features/common/schemas"
import { workspaceActionClient } from "@/lib/safe-action"

export const checkInboxAction = workspaceActionClient
  .bindArgsSchemas(workspaceIdrequestParams)
  .action(
    async ({
      bindArgsParsedInputs: [workspaceId],
    }: {
      bindArgsParsedInputs: WorkspaceIdRequestParams
    }) => {
      await scheduleQueue.add(ScheduleJobData.pollInstagramComments, {
        type: ScheduleJobData.pollInstagramComments,
        data: {},
      })

      return {
        success: true,
        checkedAt: new Date().toISOString(),
        workspaceId,
      }
    },
  )
