/* eslint-disable @typescript-eslint/no-unused-vars */

import { SaveOptions, RemoveOptions } from '@dbTools/typeorm'
import { User as dbUser } from '@entity/User'
import { UserContact } from '@entity/UserContact'
// import { UserContact as EmailContact } from '@entity/UserContact'
import { User } from '@model/User'

const communityDbUser: dbUser = {
  id: -1,
  gradidoID: '11111111-2222-4333-4444-55555555',
  alias: '',
  // email: 'support@gradido.net',
  emailContact: new UserContact(),
  emailId: -1,
  firstName: 'Gradido',
  lastName: 'Akademie',
  pubKey: Buffer.from(''),
  privKey: Buffer.from(''),
  deletedAt: null,
  password: BigInt(0),
  //  emailHash: Buffer.from(''),
  createdAt: new Date(),
  // emailChecked: false,
  language: '',
  isAdmin: null,
  publisherId: 0,
  passphrase: '',
  // default password encryption type
  passwordEncryptionType: 2,
  hasId: function (): boolean {
    throw new Error('Function not implemented.')
  },
  save: function (options?: SaveOptions): Promise<dbUser> {
    throw new Error('Function not implemented.')
  },
  remove: function (options?: RemoveOptions): Promise<dbUser> {
    throw new Error('Function not implemented.')
  },
  softRemove: function (options?: SaveOptions): Promise<dbUser> {
    throw new Error('Function not implemented.')
  },
  recover: function (options?: SaveOptions): Promise<dbUser> {
    throw new Error('Function not implemented.')
  },
  reload: function (): Promise<void> {
    throw new Error('Function not implemented.')
  },
}
const communityUser = new User(communityDbUser)

export { communityDbUser, communityUser }
