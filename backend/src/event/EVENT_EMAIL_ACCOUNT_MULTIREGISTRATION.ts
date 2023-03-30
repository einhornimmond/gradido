import { User as DbUser } from '@entity/User'
import { Event as DbEvent } from '@entity/Event'

import { Event, EventType } from './Event'

export const EVENT_EMAIL_ACCOUNT_MULTIREGISTRATION = async (user: DbUser): Promise<DbEvent> =>
  Event(EventType.EMAIL_ACCOUNT_MULTIREGISTRATION, user, { id: 0 } as DbUser).save()
