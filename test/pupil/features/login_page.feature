@login
Feature: Login page

  Scenario: Sign in page has a STA logo
    Given I am on the sign in page
    Then I should see a STA logo
    Then I should see a sign in page heading
    Then I should see a sign in button
    Then the sign in button should be disabled

  Scenario: Users cannot login with just a school pin
    Given I am on the sign in page
    When I attempt to login with just a school pin
    Then the sign in button should be disabled

  Scenario: Users cannot login with just a pupil pin
    Given I am on the sign in page
    When I attempt to login with just a pupil pin
    Then the sign in button should be disabled

  Scenario: Users can login with valid credentials
    Given I have logged in
    Then I should be taken to the confirmation page
    Then I should see all the correct pupil details
    Then local storage should be populated with questions and pupil metadata

  Scenario: Login failure message is displayed on the sign in page
    Given I am on the sign in page
    When I want to try login with invalid credentials
    Then I should see a failed login message

  Scenario: Local storage is cleared when I have logged in but I return to login page as details are not correct
    Given I have logged in
    But I have chosen that the details are not correct
    Then local storage should be cleared

  Scenario: Pupil cannot login from a different school
    Given I have attempted to enter a school I do not attend upon login
    Then I should see a failed login message

  Scenario: Speech synthesis is set to true when a pupil requiring it logs in
    Given I am logged in with a user who needs speech synthesis
    Then I should see speech synthesis set to true in the local storage

  Scenario: Speech synthesis is set to false when a pupil who doesn't require it logs in
    Given I am logged in with a user who does not need speech synthesis
    Then I should see speech synthesis set to false in the local storage

