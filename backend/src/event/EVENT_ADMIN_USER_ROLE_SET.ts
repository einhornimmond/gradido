import { Event as DbEvent } from '@entity/Event'
import { User as DbUser } from '@entity/User'

import { Event, EventType } from './Event'

export const EVENT_ADMIN_USER_ROLE_SET = async (
  user: DbUser,
  moderator: DbUser,
): Promise<DbEvent> => Event(EventType.ADMIN_USER_ROLE_SET, user, moderator).save()
