import { Decimal } from 'decimal.js-light'
import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export class TransactionSendArgs {
  @Field(() => String)
  email: string

  @Field(() => Decimal)
  amount: Decimal

  @Field(() => String)
  memo: string
}
