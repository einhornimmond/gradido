Feature: Send coins
  As a user
  I want to send and receive GDD
  I want to see transaction details on overview and transactions pages

  # Background:
  #   Given the following "users" are in the database:
  #     | email                  | password | name               |
  #     | bob@baumeister.de      | Aa12345_ | Bob Baumeister     |
  #     | raeuber@hotzenplotz.de | Aa12345_ | Räuber Hotzenplotz |

  Scenario: Send GDD to other user
    Given the user is logged in as "bob@baumeister.de" "Aa12345_"
    And the user navigates to page "/send"
    When the user fills the send form with "raeuber@hotzenplotz.de" "120,50" "Some memo text"
    And the user submits the send form
    Then the transaction details are presented for confirmation
    When the user submits the transaction by confirming
    Then the transaction details are displayed on the transcations page

