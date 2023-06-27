import { Then, When } from '@badeball/cypress-cucumber-preprocessor'
import { ResetPasswordPage } from '../../e2e/models/ResetPasswordPage'
import { UserEMailSite } from '../../e2e/models/UserEMailSite'

const userEMailSite = new UserEMailSite()
const resetPasswordPage = new ResetPasswordPage()

Then('the user receives an e-mail containing the {string} link', (linkName: string) => {
  let emailSubject: string
  let linkPattern: RegExp

  switch (linkName) {
    case 'activation':
      emailSubject = 'Email Verification'
      linkPattern = /\/checkEmail\/[0-9]+\d/
      break
    case 'password reset':
      emailSubject = 'asswor'
      linkPattern = /\/reset-password\/[0-9]+\d/
      break
    default:
      throw new Error(`Error in "Then the user receives an e-mail containing the {string} link" step: incorrect linkname string "${linkName}"`)
  }
  
  cy.origin(
    Cypress.env('mailserverURL'),
    { args: { emailSubject, linkPattern, userEMailSite } },
    ({ emailSubject, linkPattern, userEMailSite }) => {      
      cy.visit('/') // navigate to user's e-mail site (on fake mail server)
      cy.get(userEMailSite.emailInbox).should('be.visible')

      cy.get(userEMailSite.emailList)
        .find('.email-item')
        .filter(`:contains(${emailSubject})`)
        .first()
        .click()

      cy.get(userEMailSite.emailMeta)
        .find(userEMailSite.emailSubject)
        .contains(emailSubject)

      cy.get('.email-content', { timeout: 2000})
        .find('.plain-text')
        .contains(linkPattern)
        .invoke('text')
        .then((text) => {
          const emailLink = text.match(linkPattern)[0]
          cy.task('setEmailLink', emailLink)
        })
    }
  )
})

Then('the user receives no password reset e-mail', () => {
  cy.origin(
    Cypress.env('mailserverURL'),
    { args: { userEMailSite } },
    ({ userEMailSite }) => {      
      cy.visit('/')
      cy.get(userEMailSite.emailList).should('be.visible')

      cy.get(userEMailSite.emailList)
        .find('.email-item')
        .should('have.length', 0)
    }
  )
})

When('the user opens the {string} link in the browser', (linkName: string) => {
  cy.task('getEmailLink').then((emailLink) => {
    cy.visit(emailLink)
  })
  cy.get(resetPasswordPage.newPasswordInput).should('be.visible')
})
