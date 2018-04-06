@login
Feature: Login page

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

  Scenario: Users cannot login with just a school pin
    Given I am on the sign in page
    When I attempt to login with just a school pin
    Then the sign in button should be disabled

  Scenario: Users cannot login with just a pupil pin
    Given I am on the sign in page
    When I attempt to login with just a pupil pin
    Then the sign in button should be disabled

  @mo
  Scenario: Users can login with valid credentials
    Given I have logged in
    Then I should be taken to the confirmation page
    Then I should all the correct pupil details

  Scenario: Error is displayed when no details are entered
    Given I am on the sign in page
    When I have not entered any sign in details
    Then the sign in button should be disabled

  Scenario: Login failure page allows users to try again
    Given I am on the login failure page
    When I want to try logging in again
    Then I should be taken to the sign in page

  Scenario: Login failure page has a heading
    Given I am on the login failure page
    Then I should see a sign in page failure heading

  Scenario: Login page has some instructions
    Given I am on the login failure page
    Then I should see some text instructing me on what to do next

  Scenario: Local storage is populated with the questions and pupil metadata upon login
    Given I have logged in
    Then local storage should be populated with questions and pupil metadata

  Scenario: Local storage is cleared when I have logged in but I return to login page as details are not correct
    Given I have logged in
    But I have chosen that the details are not correct
    Then local storage should be cleared

  Scenario: Pupil cannot login from a different school
    Given I have attempted to enter a school I do not attend upon login
    Then I should be taken to the sign in failure page

  Scenario: Speech synthesis is set to true when a pupil requiring it logs in
    Given I am logged in with a user who needs speech synthesis
    Then I should see speech synthesis set to true in the local storage

  Scenario: Speech synthesis is set to false when a pupil who doesn't require it logs in
    Given I am logged in with a user who does not need speech synthesis
    Then I should see speech synthesis set to false in the local storage

  Scenario: Sign in button is disabled by default
    Given I am on the sign in page
    Then the sign in button should be disabled

  Scenario: Sign in button is disabled until school password and pupil pin are entered
    Given I have entered a school password
    But the sign in button is still disabled
    When I enter a pupil pin
    Then I should see the sign in button enabled

  Scenario: Sign in button is disabled until pupil pin and school password are entered
    Given I have entered a pupil pin
    But the sign in button is still disabled
    When I enter a school password
    Then I should see the sign in button enabled
