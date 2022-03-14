/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthChecker } from 'type-graphql'

import { decode, encode } from '@/auth/JWT'
import { ROLE_UNAUTHORIZED, ROLE_USER, ROLE_ADMIN } from '@/auth/ROLES'
import { RIGHTS } from '@/auth/RIGHTS'
import { getCustomRepository } from '@dbTools/typeorm'
import { UserRepository } from '@repository/User'
import { INALIENABLE_RIGHTS } from '@/auth/INALIENABLE_RIGHTS'
import { ServerUser } from '@entity/ServerUser'

const isAuthorized: AuthChecker<any> = async ({ context }, rights) => {
  context.role = ROLE_UNAUTHORIZED // unauthorized user

  // is rights an inalienable right?
  if ((<RIGHTS[]>rights).reduce((acc, right) => acc && INALIENABLE_RIGHTS.includes(right), true))
    return true

  // Do we have a token?
  if (context.token) {
    // Decode the token
    const decoded = decode(context.token)
    if (!decoded) {
      throw new Error('403.13 - Client certificate revoked')
    }
    // Set context pubKey
    context.pubKey = Buffer.from(decoded.pubKey).toString('hex')

    // Problem found by unit testing:
    // I have a valid token in the context, but the database is cleaned,
    // so the user object cannot be found here
    // this should be working for inalienable rights

    // set new header token
    // TODO - load from database dynamically & admin - maybe encode this in the token to prevent many database requests
    // TODO this implementation is bullshit - two database queries cause our user identifiers are not aligned and vary between email, id and pubKey
    const userRepository = await getCustomRepository(UserRepository)
    try {
      const user = await userRepository.findByPubkeyHex(context.pubKey)
      const countServerUsers = await ServerUser.count({ email: user.email })
      context.role = countServerUsers > 0 ? ROLE_ADMIN : ROLE_USER

      context.setHeaders.push({ key: 'token', value: encode(decoded.pubKey) })
    } catch {
      throw new Error('401 Unauthorized')
    }
  }

  // check for correct rights
  const missingRights = (<RIGHTS[]>rights).filter((right) => !context.role.hasRight(right))
  if (missingRights.length !== 0) {
    throw new Error('401 Unauthorized')
  }

  return true
}

export default isAuthorized
