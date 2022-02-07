/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ObjectType, Field } from 'type-graphql'
import { Decay } from './Decay'

// we need a better solution for the decay block:
// the first transaction on the first page shows the decay since the last transaction
// the format is actually a Decay and not a Transaction.
// Therefore we have a lot of nullable fields, which should be always present

@ObjectType()
export class Transaction {
  constructor() {
    this.type = ''
    this.balance = 0
    this.totalBalance = 0
    this.memo = ''
    this.firstTransaction = false
  }

  @Field(() => String)
  type: string

  @Field(() => Number)
  balance: number

  @Field(() => Number)
  totalBalance: number

  @Field(() => String)
  memo: string

  @Field(() => Number, { nullable: true })
  transactionId?: number

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  email?: string

  @Field({ nullable: true })
  date?: string

  @Field({ nullable: true })
  decay?: Decay

  @Field(() => Boolean)
  firstTransaction: boolean
}
