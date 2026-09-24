import type { Session } from "next-auth";

/**
 * Attaches the persisted user id to the session's user object.
 * Kept separate from lib/auth.ts (which initializes NextAuth's providers/
 * adapter on import) so this business logic is testable in isolation.
 */
export function attachUserId(
  session: Session,
  user: { id: string }
): Session {
  if (session.user) {
    session.user.id = user.id;
  }
  return session;
}
