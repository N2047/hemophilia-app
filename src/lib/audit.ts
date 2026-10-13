import { prisma } from './prisma';
import { SessionUser } from './auth';

export interface AuditParams {
  user?: SessionUser | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  reason?: string;
  ipAddress?: string;
}

export async function createAuditLog(
  {
    user,
    action,
    entityType,
    entityId,
    details,
    reason,
    ipAddress,
  }: AuditParams,
  tx?: any
) {
  try {
    const client = tx || prisma;
    // Sanitize sensitive fields if present
    const sanitizedDetails = { ...details };
    delete sanitizedDetails.password;
    delete sanitizedDetails.passwordHash;
    delete sanitizedDetails.token;
    delete sanitizedDetails.secret;

    await client.auditLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || (user?.username ?? 'प्रणाली (System)'),
        officeId: user?.officeId || null,
        action,
        entityType,
        entityId,
        details: JSON.stringify(sanitizedDetails),
        reason: reason || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Audit log failed to write:', error);
  }
}
