/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Connection } from '@dbTools/typeorm'
import { Event as DbEvent } from '@entity/Event'
import { ApolloServerTestClient } from 'apollo-server-testing'

import { testEnvironment, cleanDB, resetToken } from '@test/helpers'

import { addFieldsToSubscriber } from '@/apis/KlicktippController'
import { creations } from '@/seeds/creation'
import { creationFactory } from '@/seeds/factory/creation'
import { userFactory } from '@/seeds/factory/user'
import { login } from '@/seeds/graphql/mutations'
import { bibiBloxberg } from '@/seeds/users/bibi-bloxberg'

import { exportEventDataToKlickTipp } from './klicktipp'

jest.mock('@/apis/KlicktippController', () => {
  const originalModule = jest.requireActual('@/apis/KlicktippController')
  return {
    __esModule: true,
    ...originalModule,
    getKlickTippUser: jest.fn((email) => originalModule.getKlickTippUser(email)),
    addFieldsToSubscriber: jest.fn((email, a) => originalModule.addFieldsToSubscriber(email, a)),
  }
})

let mutate: ApolloServerTestClient['mutate'],
  query: ApolloServerTestClient['query'],
  con: Connection
let testEnv: {
  mutate: ApolloServerTestClient['mutate']
  query: ApolloServerTestClient['query']
  con: Connection
}

beforeAll(async () => {
  testEnv = await testEnvironment()
  mutate = testEnv.mutate
  query = testEnv.query
  con = testEnv.con
  await DbEvent.clear()
})

afterAll(async () => {
  await cleanDB()
  await con.close()
})

describe('klicktipp', () => {
  beforeAll(async () => {
    await userFactory(testEnv, bibiBloxberg)
    const bibisCreation = creations.find((creation) => creation.email === 'bibi@bloxberg.de')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await creationFactory(testEnv, bibisCreation!)
    await mutate({
      mutation: login,
      variables: { email: 'bibi@bloxberg.de', password: 'Aa12345_' },
    })
    void exportEventDataToKlickTipp()
  })

  afterAll(async () => {
    await cleanDB()
    resetToken()
  })

  describe('exportEventDataToKlickTipp', () => {
    it('calls the KlicktippController', () => {
      expect(addFieldsToSubscriber).toBeCalled()
    })
  })
})
