import { db } from "@chatbotx.io/database/client"
import { invitationModel, userModel } from "@chatbotx.io/database/schema"
import { BaseService } from "../base.service"

class InvitationService extends BaseService {
  async isEmailAllowed(email: string): Promise<boolean> {
    if (!email) return false
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Check if user already exists in the system
    const existingUser = await db.query.userModel.findFirst({
      where: (fields, { eq }) => eq(fields.email, normalizedEmail),
    })
    if (existingUser) {
      return true
    }

    // 2. Check if an active invitation exists for this email
    const invitation = await db.query.invitationModel.findFirst({
      where: (fields, { eq, and, gte }) =>
        and(
          eq(fields.email, normalizedEmail),
          gte(fields.expiresAt, new Date()),
        ),
    })

    return Boolean(invitation)
  }
}

export const invitationService = new InvitationService()
