import { mount } from '@vue/test-utils'
import ContributionMessagesFormular from './ContributionMessagesFormular'
import { toastErrorSpy, toastSuccessSpy } from '../../../test/testSetup'
import { adminCreateContributionMessage } from '@/graphql/adminCreateContributionMessage'

const localVue = global.localVue

const apolloMutateMock = jest.fn().mockResolvedValue()

describe('ContributionMessagesFormular', () => {
  let wrapper

  const propsData = {
    contributionId: 42,
  }

  const mocks = {
    $t: jest.fn((t) => t),
    $apollo: {
      mutate: apolloMutateMock,
    },
    $i18n: {
      locale: 'en',
    },
  }

  const Wrapper = () => {
    return mount(ContributionMessagesFormular, {
      localVue,
      mocks,
      propsData,
    })
  }

  describe('mount', () => {
    beforeEach(() => {
      wrapper = Wrapper()
      jest.clearAllMocks()
    })

    it('has a DIV .contribution-messages-formular', () => {
      expect(wrapper.find('div.contribution-messages-formular').exists()).toBe(true)
    })

    describe('on trigger reset', () => {
      beforeEach(async () => {
        wrapper.setData({
          form: {
            text: 'text form message',
          },
        })
        await wrapper.find('form').trigger('reset')
      })

      it('form has empty text', () => {
        expect(wrapper.vm.form).toEqual({
          text: '',
        })
      })
    })

    describe('on trigger submit', () => {
      beforeEach(async () => {
        wrapper.setData({
          form: {
            text: 'text form message',
          },
        })
        await wrapper.find('form').trigger('submit')
      })

      it('emitted "get-list-contribution-messages" with data', async () => {
        expect(wrapper.emitted('get-list-contribution-messages')).toEqual(
          expect.arrayContaining([expect.arrayContaining([42])]),
        )
      })

      it('emitted "update-status" with data', async () => {
        expect(wrapper.emitted('update-status')).toEqual(
          expect.arrayContaining([expect.arrayContaining([42])]),
        )
      })
    })

    describe('send DIALOG contribution message with success', () => {
      beforeEach(async () => {
        await wrapper.setData({
          form: {
            text: 'text form message',
          },
        })
        await wrapper.find('button[data-test="submit-dialog"]').trigger('click')
      })

      it('moderatorMesage has `DIALOG`', () => {
        expect(apolloMutateMock).toBeCalledWith({
          mutation: adminCreateContributionMessage,
          variables: {
            contributionId: 42,
            message: 'text form message',
            messageType: 'DIALOG',
          },
        })
      })

      it('toasts an success message', () => {
        expect(toastSuccessSpy).toBeCalledWith('message.request')
      })
    })

    describe('send MODERATOR contribution message with success', () => {
      beforeEach(async () => {
        await wrapper.setData({
          form: {
            text: 'text form message',
          },
        })
        await wrapper.find('button[data-test="submit-moderator"]').trigger('click')
      })

      it('moderatorMesage has `MODERATOR`', () => {
        expect(apolloMutateMock).toBeCalledWith({
          mutation: adminCreateContributionMessage,
          variables: {
            contributionId: 42,
            message: 'text form message',
            messageType: 'MODERATOR',
          },
        })
      })

      it('toasts an success message', () => {
        expect(toastSuccessSpy).toBeCalledWith('message.request')
      })
    })

    describe('send contribution message with error', () => {
      beforeEach(async () => {
        apolloMutateMock.mockRejectedValue({ message: 'OUCH!' })
        wrapper = Wrapper()
        await wrapper.find('form').trigger('submit')
      })

      it('toasts an error message', () => {
        expect(toastErrorSpy).toBeCalledWith('OUCH!')
      })
    })
  })
})
