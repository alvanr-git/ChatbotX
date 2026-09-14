import { and, db, eq, gte } from "@chatbotx.io/database/client"
import { invitationModel, userModel } from "@chatbotx.io/database/schema"
import type { InvitationModel } from "@chatbotx.io/database/types"
import { BaseService } from "../base.service"
import { notFoundException } from "../errors"

class InvitationService extends BaseService {
  async isEmailAllowed(email: string): Promise<boolean> {
    if (!email) {
      return false
    }
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Check if user already exists in the system
    const [existingUser] = await db
      .select()
      .from(userModel)
      .where(eq(userModel.email, normalizedEmail))
      .limit(1)

    if (existingUser) {
      return true
    }

    // 2. Check if an active invitation exists for this email
    const [invitation] = await db
      .select()
      .from(invitationModel)
      .where(
        and(
          eq(invitationModel.email, normalizedEmail),
          gte(invitationModel.expiresAt, new Date()),
        ),
      )
      .limit(1)

    return Boolean(invitation)
  }

  async findByCodeOrFail(code: string): Promise<InvitationModel> {
    const invitation = await db.query.invitationModel.findFirst({
      where: { code },
    })
    if (!invitation) {
      throw notFoundException("Invitation not found")
    }
    return invitation
  }
}

export const invitationService = new InvitationService()
