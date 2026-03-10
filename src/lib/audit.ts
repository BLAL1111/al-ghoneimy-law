import { prisma } from './prisma'
import { NextApiRequest } from 'next'

export interface ChangeDetail {
  field: string
  oldValue: any
  newValue: any
}

export async function createAuditLog(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entity: 'Case' | 'Client' | 'Session' | 'Document' | 'User',
  entityId: string,
  changes: ChangeDetail[] | null,
  req?: NextApiRequest
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress: req?.headers['x-forwarded-for']?.toString() || req?.socket?.remoteAddress,
        userAgent: req?.headers['user-agent'],
      }
    })
  } catch (error) {
    console.error('فشل تسجيل السجل:', error)
  }
}

// دالة لمقارنة التغييرات بين الكائن القديم والجديد
export function getChanges(
  oldData: any,
  newData: any,
  ignoreFields: string[] = ['id', 'createdAt', 'updatedAt', 'createdById', 'updatedById']
): ChangeDetail[] {
  const changes: ChangeDetail[] = []
  
  for (const key in newData) {
    if (ignoreFields.includes(key)) continue
    
    // تحويل التواريخ إلى نص للمقارنة
    const oldValue = oldData[key] instanceof Date ? oldData[key].toISOString() : oldData[key]
    const newValue = newData[key] instanceof Date ? newData[key].toISOString() : newData[key]
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue: oldValue,
        newValue: newValue,
      })
    }
  }
  
  return changes
}