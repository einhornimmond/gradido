/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Resolver, Query, Args, Authorized, Ctx, Mutation } from 'type-graphql'
import { getCustomRepository, getConnection, QueryRunner } from '@dbTools/typeorm'

import CONFIG from '../../config'
import { sendTransactionReceivedEmail } from '../../mailer/sendTransactionReceivedEmail'

import { Transaction } from '../model/Transaction'
import { TransactionList } from '../model/TransactionList'

import TransactionSendArgs from '../arg/TransactionSendArgs'
import Paginated from '../arg/Paginated'

import { Order } from '../enum/Order'

import { UserRepository } from '../../typeorm/repository/User'
import { TransactionRepository } from '../../typeorm/repository/Transaction'

import { User as dbUser } from '@entity/User'
import { Transaction as dbTransaction } from '@entity/Transaction'
import { Balance as dbBalance } from '@entity/Balance'

import { apiPost } from '../../apis/HttpRequest'
import { roundFloorFrom4, roundCeilFrom4 } from '../../util/round'
import { calculateDecay } from '../../util/decay'
import { TransactionTypeId } from '../enum/TransactionTypeId'
import { TransactionType } from '../enum/TransactionType'
import { hasUserAmount, isHexPublicKey } from '../../util/validate'
import { RIGHTS } from '../../auth/RIGHTS'

// helper helper function
async function updateStateBalance(
  user: dbUser,
  balance: number,
  received: Date,
  queryRunner: QueryRunner,
): Promise<dbBalance> {
  let userBalance = await dbBalance.findOne({ userId: user.id })
  if (!userBalance) {
    userBalance = new dbBalance()
    userBalance.userId = user.id
    userBalance.amount = balance
    userBalance.modified = received
  } else {
    userBalance.amount = balance
    userBalance.modified = new Date()
  }
  if (userBalance.amount <= 0) {
    throw new Error('error new balance <= 0')
  }
  userBalance.recordDate = received
  return queryRunner.manager.save(userBalance).catch((error) => {
    throw new Error('error saving balance:' + error)
  })
}

async function calculateNewBalance(
  userId: number,
  transactionDate: Date,
  centAmount: number,
): Promise<number> {
  let newBalance = centAmount
  const transactionRepository = getCustomRepository(TransactionRepository)
  const lastUserTransaction = await transactionRepository.findLastForUser(userId)
  if (lastUserTransaction) {
    newBalance += Number(
      calculateDecay(
        Number(lastUserTransaction.balance),
        lastUserTransaction.balanceDate,
        transactionDate,
      ).balance,
    )
  }

  if (newBalance <= 0) {
    throw new Error('error new balance <= 0')
  }

  return newBalance
}
@Resolver()
export class TransactionResolver {
  @Authorized([RIGHTS.TRANSACTION_LIST])
  @Query(() => TransactionList)
  async transactionList(
    @Args()
    {
      currentPage = 1,
      pageSize = 25,
      order = Order.DESC,
      onlyCreations = false,
      userId,
    }: Paginated,
    @Ctx() context: any,
  ): Promise<TransactionList> {
    // load user
    const userRepository = getCustomRepository(UserRepository)
    const user = userId
      ? await userRepository.findOneOrFail({ id: userId }, { withDeleted: true })
      : await userRepository.findByPubkeyHex(context.pubKey)
    let limit = pageSize
    let offset = 0
    let skipFirstTransaction = false
    if (currentPage > 1) {
      offset = (currentPage - 1) * pageSize - 1
      limit++
    }
    if (offset && order === Order.ASC) {
      offset--
    }
    const transactionRepository = getCustomRepository(TransactionRepository)
    const [userTransactions, userTransactionsCount] = await transactionRepository.findByUserPaged(
      user.id,
      limit,
      offset,
      order,
      onlyCreations,
    )
    skipFirstTransaction = userTransactionsCount > offset + limit
    const decay = !(currentPage > 1)
    const transactions: Transaction[] = []
    if (userTransactions.length) {
      if (order === Order.DESC) {
        userTransactions.reverse()
      }
      const involvedUserIds: number[] = []

      userTransactions.forEach((transaction: dbTransaction) => {
        involvedUserIds.push(transaction.userId)
        if (
          transaction.typeId === TransactionTypeId.SEND ||
          transaction.typeId === TransactionTypeId.RECEIVE
        ) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          involvedUserIds.push(transaction.linkedUserId!) // TODO ensure not null properly
        }
      })
      // remove duplicates
      // https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
      const involvedUsersUnique = involvedUserIds.filter((v, i, a) => a.indexOf(v) === i)
      const userRepository = getCustomRepository(UserRepository)
      const userIndiced = await userRepository.getUsersIndiced(involvedUsersUnique)

      for (let i = 0; i < userTransactions.length; i++) {
        const userTransaction = userTransactions[i]
        const finalTransaction = new Transaction()
        finalTransaction.transactionId = userTransaction.id
        finalTransaction.date = userTransaction.balanceDate.toISOString()
        finalTransaction.memo = userTransaction.memo
        finalTransaction.totalBalance = roundFloorFrom4(Number(userTransaction.balance))
        const previousTransaction = i > 0 ? userTransactions[i - 1] : null

        if (previousTransaction) {
          const currentTransaction = userTransaction
          const decay = calculateDecay(
            Number(previousTransaction.balance),
            previousTransaction.balanceDate,
            currentTransaction.balanceDate,
          )
          const balance = Number(previousTransaction.balance) - decay.balance

          if (CONFIG.DECAY_START_TIME < currentTransaction.balanceDate) {
            finalTransaction.decay = decay
            finalTransaction.decay.balance = roundFloorFrom4(balance)
            if (
              previousTransaction.balanceDate < CONFIG.DECAY_START_TIME &&
              currentTransaction.balanceDate > CONFIG.DECAY_START_TIME
            ) {
              finalTransaction.decay.decayStartBlock = (
                CONFIG.DECAY_START_TIME.getTime() / 1000
              ).toString()
            }
          }
        }

        finalTransaction.balance = roundFloorFrom4(Number(userTransaction.amount)) // Todo unsafe conversion

        const otherUser = userIndiced.find((u) => u.id === userTransaction.linkedUserId)
        switch (userTransaction.typeId) {
          case TransactionTypeId.CREATION:
            finalTransaction.name = 'Gradido Akademie'
            finalTransaction.type = TransactionType.CREATION
            break
          case TransactionTypeId.SEND:
            finalTransaction.type = TransactionType.SEND
            if (otherUser) {
              finalTransaction.name = otherUser.firstName + ' ' + otherUser.lastName
              finalTransaction.email = otherUser.email
            }
            break
          case TransactionTypeId.RECEIVE:
            finalTransaction.type = TransactionType.RECIEVE
            if (otherUser) {
              finalTransaction.name = otherUser.firstName + ' ' + otherUser.lastName
              finalTransaction.email = otherUser.email
            }
            break
          default:
            throw new Error('invalid transaction')
        }
        if (i > 0 || !skipFirstTransaction) {
          transactions.push(finalTransaction)
        }

        if (i === userTransactions.length - 1 && decay) {
          const now = new Date()
          const decay = calculateDecay(
            Number(userTransaction.balance),
            userTransaction.balanceDate,
            now,
          )
          const balance = Number(userTransaction.balance) - decay.balance

          const decayTransaction = new Transaction()
          decayTransaction.type = 'decay'
          decayTransaction.balance = roundCeilFrom4(balance)
          decayTransaction.decayDuration = decay.decayDuration
          decayTransaction.decayStart = decay.decayStart
          decayTransaction.decayEnd = decay.decayEnd
          transactions.push(decayTransaction)
        }
      }

      if (order === Order.DESC) {
        transactions.reverse()
      }
    }

    const transactionList = new TransactionList()
    transactionList.count = userTransactionsCount
    transactionList.transactions = transactions

    // get gdt sum
    transactionList.gdtSum = null
    try {
      const resultGDTSum = await apiPost(`${CONFIG.GDT_API_URL}/GdtEntries/sumPerEmailApi`, {
        email: user.email,
      })
      if (resultGDTSum.success) transactionList.gdtSum = Number(resultGDTSum.data.sum) || 0
    } catch (err: any) {}

    // get balance
    const balanceEntity = await dbBalance.findOne({ userId: user.id })
    if (balanceEntity) {
      const now = new Date()
      transactionList.balance = roundFloorFrom4(balanceEntity.amount)
      // TODO: Add a decay object here instead of static data representing the decay.
      transactionList.decay = roundFloorFrom4(
        calculateDecay(balanceEntity.amount, balanceEntity.recordDate, now).balance,
      )
      transactionList.decayDate = now.toString()
    }

    return transactionList
  }

  @Authorized([RIGHTS.SEND_COINS])
  @Mutation(() => String)
  async sendCoins(
    @Args() { email, amount, memo }: TransactionSendArgs,
    @Ctx() context: any,
  ): Promise<boolean> {
    // TODO this is subject to replay attacks
    const userRepository = getCustomRepository(UserRepository)
    const senderUser = await userRepository.findByPubkeyHex(context.pubKey)
    if (senderUser.pubKey.length !== 32) {
      throw new Error('invalid sender public key')
    }
    // validate amount
    if (!hasUserAmount(senderUser, amount)) {
      throw new Error("user hasn't enough GDD or amount is < 0")
    }

    // validate recipient user
    const recipientUser = await dbUser.findOne({ email: email }, { withDeleted: true })
    if (!recipientUser) {
      throw new Error('recipient not known')
    }
    if (recipientUser.deletedAt) {
      throw new Error('The recipient account was deleted')
    }
    if (!isHexPublicKey(recipientUser.pubKey.toString('hex'))) {
      throw new Error('invalid recipient public key')
    }

    const centAmount = Math.trunc(amount * 10000)

    const queryRunner = getConnection().createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const receivedCallDate = new Date()
      // transaction
      const transactionSend = new dbTransaction()
      transactionSend.typeId = TransactionTypeId.SEND
      transactionSend.memo = memo
      transactionSend.userId = senderUser.id
      transactionSend.linkedUserId = recipientUser.id
      transactionSend.amount = BigInt(centAmount)
      const sendBalance = await calculateNewBalance(senderUser.id, receivedCallDate, -centAmount)
      transactionSend.balance = BigInt(Math.trunc(sendBalance))
      transactionSend.balanceDate = receivedCallDate
      transactionSend.sendSenderFinalBalance = transactionSend.balance
      await queryRunner.manager.insert(dbTransaction, transactionSend)

      const transactionReceive = new dbTransaction()
      transactionReceive.typeId = TransactionTypeId.RECEIVE
      transactionReceive.memo = memo
      transactionReceive.userId = recipientUser.id
      transactionReceive.linkedUserId = senderUser.id
      transactionReceive.amount = BigInt(centAmount)
      const receiveBalance = await calculateNewBalance(
        recipientUser.id,
        receivedCallDate,
        centAmount,
      )
      transactionReceive.balance = BigInt(Math.trunc(receiveBalance))
      transactionReceive.balanceDate = receivedCallDate
      transactionReceive.sendSenderFinalBalance = transactionSend.balance
      transactionReceive.linkedTransactionId = transactionSend.id
      await queryRunner.manager.insert(dbTransaction, transactionReceive)

      // Save linked transaction id for send
      transactionSend.linkedTransactionId = transactionReceive.id
      await queryRunner.manager.update(dbTransaction, { id: transactionSend.id }, transactionSend)

      // Update Balance sender
      await updateStateBalance(senderUser, Math.trunc(sendBalance), receivedCallDate, queryRunner)

      // Update Balance recipient
      await updateStateBalance(
        recipientUser,
        Math.trunc(receiveBalance),
        receivedCallDate,
        queryRunner,
      )

      await queryRunner.commitTransaction()
    } catch (e) {
      await queryRunner.rollbackTransaction()
      throw new Error(`Transaction was not successful: ${e}`)
    } finally {
      await queryRunner.release()
    }
    // send notification email
    // TODO: translate
    await sendTransactionReceivedEmail({
      senderFirstName: senderUser.firstName,
      senderLastName: senderUser.lastName,
      recipientFirstName: recipientUser.firstName,
      recipientLastName: recipientUser.lastName,
      email: recipientUser.email,
      amount,
      memo,
    })

    return true
  }
}
