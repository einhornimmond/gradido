import { INALIENABLE_RIGHTS } from './INALIENABLE_RIGHTS'
import { RIGHTS } from './RIGHTS'
import { Role } from './Role'

export const ROLE_UNAUTHORIZED = new Role('unauthorized', INALIENABLE_RIGHTS)
export const ROLE_USER = new Role('user', [
  ...INALIENABLE_RIGHTS,
  RIGHTS.VERIFY_LOGIN,
  RIGHTS.BALANCE,
  RIGHTS.LIST_GDT_ENTRIES,
  RIGHTS.EXIST_PID,
  RIGHTS.GET_KLICKTIPP_USER,
  RIGHTS.GET_KLICKTIPP_TAG_MAP,
  RIGHTS.UNSUBSCRIBE_NEWSLETTER,
  RIGHTS.SUBSCRIBE_NEWSLETTER,
  RIGHTS.TRANSACTION_LIST,
  RIGHTS.SEND_COINS,
  RIGHTS.LOGOUT,
  RIGHTS.UPDATE_USER_INFOS,
  RIGHTS.HAS_ELOPAGE,
  RIGHTS.CREATE_TRANSACTION_LINK,
  RIGHTS.DELETE_TRANSACTION_LINK,
  RIGHTS.REDEEM_TRANSACTION_LINK,
  RIGHTS.LIST_TRANSACTION_LINKS,
  RIGHTS.GDT_BALANCE,
  RIGHTS.CREATE_CONTRIBUTION,
  RIGHTS.DELETE_CONTRIBUTION,
  RIGHTS.LIST_CONTRIBUTIONS,
  RIGHTS.LIST_ALL_CONTRIBUTIONS,
  RIGHTS.UPDATE_CONTRIBUTION,
  RIGHTS.LIST_CONTRIBUTION_LINKS,
  RIGHTS.COMMUNITY_STATISTICS,
])
export const ROLE_ADMIN = new Role('admin', Object.values(RIGHTS)) // all rights

// TODO from database
export const ROLES = [ROLE_UNAUTHORIZED, ROLE_USER, ROLE_ADMIN]
