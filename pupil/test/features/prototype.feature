Feature:
  As a development team
  We would like to show key stakeholders a prototype of the app
  In order to gain feedback and show progress

  Scenario: Sign in page has a STA logo
    Given I am on the sign in page
    Then I should see a STA logo

  Scenario: Sign in has a heading
    Given I am on the sign in page
    Then I should see a sign in page heading

  Scenario: Sign in has intro text
    Given I am on the sign in page
    Then I should see some sign in page intro text

  Scenario: Sign in page has a sign in button
    Given I am on the sign in page
    Then I should see a sign in button

  Scenario: Instructions are displayed if user wants to preview the check
    Given I have logged in
    When I click the link to read instructions
    Then I should be shown instructions on how the check works

  Scenario: Confirmation page is displayed to the pupil on login
    Given I have logged in
    Then I should be shown the confirmation page displaying my name

  Scenario: Confirmation page has a link to take back to sign page if details not correct
    Given I have logged in
    When I click the link to enter my details again
    Then I should be taken back to the sign in page

  Scenario: Starting the checks gives users 2 seconds before the first question is displayed
    Given I have logged in
    When I start the check
    Then I should have 2 seconds before i see the first question

  Scenario: Check page has a question
    Given I am on the check page
    Then I should see a question

  Scenario: Check page has a way to submit your answer
    Given I am on the check page
    Then I should see a way to submit my answer

  Scenario: Check page has a 5 second timer for each question
    Given I am on the check page
    Then I should see that i have 5 seconds to answer the question

  Scenario: Check page gives users 5 seconds to answer the question and then moves on
    Given I am on the check page
    And I could not answer the question within 5 seconds
    Then I should be moved to the next question after 5 seconds

  Scenario: Users do not have to wait 5 seconds if they submit an answer before the time is up
    Given I am on the check page
    And I could answer the check page question within 5 seconds
    Then I should be moved to the next question

  Scenario: Completion page has a heading
    Given I am on the complete page
    Then I should see a complete page heading

  Scenario: Complete page has text
    Given I am on the complete page
    Then I should see some text stating i have completed the check

  Scenario: Complete page allows users to restart the check
    Given I am on the complete page
    Then I should be able to sign out

  Scenario: Choosing to restart the check takes you back to the start page
    Given I am on the complete page
    When I choose to sign out
    Then I should be taken back to the sign in page

  Scenario: On screen keyboard is displayed on check page
    Given I am on the check page
    Then I should see the on screen keyboard

  Scenario: Users can enter answers by using the on screen keyboard
    Given I am on the check page
    Then I can answer the question using the on screen keyboard

  @check_complete @non_browserstack_compliant
  Scenario: Users can complete the test using the on screen keyboard
    Given I am on the check page
    Then I should be able to use the on screen keyboard to complete the test
    And the answers should be stored
    And the result should be stored
    And I should see that the correct pin details are used for a given answer

  @check_complete @non_browserstack_compliant
  Scenario: When no answer is provided an empty answer is recorded
    Given I am on the check page
    When I could not answer the question
    Then the answer should be stored as empty

  @check_complete @non_browserstack_compliant
  Scenario: Result stored as fail when Pass mark is not met
    Given I did not answer enough questions correctly to pass
    Then the result should be stored as fail

  @check_complete @non_browserstack_compliant
  Scenario: Result stored as pass when Pass mark is met
    Given I did answer enough questions correctly to pass
    Then the result should be stored as pass

  @check_complete @non_browserstack_compliant
  Scenario: Result can be stored with no leading zeros
    Given I answered questions correctly but with leading zeros
    Then the results should be stored as pass
    And the answers should be stored with leading zeros

  Scenario: Autocomplete is turned off
    Given I am on the sign in page
    Then I can see that the autocomplete is turned off

  Scenario: Users can go to the feedback page once they have completed the check
    Given I am on the complete page
    When I choose to give feedback
    Then I should be taken to the feedback page

  Scenario: Users can supply the method of entry on the feedback page
    Given I am on the feedback page
    Then I should be able to provide my method of entry

  Scenario: Users can give feedback on how difficult it was to enter answers
    Given I am on the feedback page
    Then I should be able to give feedback on how difficult it was to enter answers

  Scenario: Users can submit their feedback
    Given I am on the feedback page
    When I have provided my feedback
    Then I should be able to submit my feedback
    And I should be shown the thanks page

  Scenario: Start and finish times of the check are recorded
    Given I have completed the check
    Then the time i started and finished should be recorded

  @manual
  Scenario: check the google spread sheet after feedback
    Given I have given my pupil feedback
    Then I should an entry in the google spreadsheet

  Scenario Outline: Users cannot login with just a school pin
    Given I am on the sign in page
    When I attempt to login with just a school pin for school <school>
    Then I should be taken to the sign in failure page

    Examples:
      | school  |
      | 9991001 |
      | 9991002 |
      | 9991003 |
      | 9991004 |
      | 9991005 |
      | 9991999 |

  Scenario: Users cannot login with just a pupil pin
    Given I am on the sign in page
    When I attempt to login with just a pupil pin
    Then I should be taken to the sign in failure page

  Scenario: Pins are expired once a check has started
    Given I have logged in
    When I start the check
    Then my pin should be expired
    And I cannot relogin
