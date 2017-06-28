@5_digit
Feature:
  As a enforcer
  I want to ensure users are authenticated via a 5 digit pin
  So I can be certain of no maladministration

  Scenario: Pins should only contain alpha numeric characters
    Given 5 digit pins have been generated
    Then they should only consist of alphanumeric characters

  Scenario: Number of login attempts are recorded
    Given I have attempted to login 5 times
    Then the number of attempts should be recorded

  Scenario: The details of login are recorded
    Given I have logged in
    Then the details of the login should be recorded

  Scenario: Validation error is displayed when PIN is invalid
    Given I have entered an invalid pin
    Then I should see a validation error

  Scenario: Try again takes you to sign page
    Given I am on the validation error page
    When I click the link to try again
    Then I should be taken back to the sign in page

  Scenario: Error is displayed when no details are entered
    Given I have not entered any sign in details
    Then I should see a error page

  Scenario: Failed login attempt is recorded when the PIN is missing
    Given I have not entered a pin
    Then I should not be logged in
    And the login attempt should be recorded

  Scenario: Failed login attempt is recorded when the PIN is present but the data is missing
    Given I have not entered valid pins
    Then I should not be logged in
    And the login attempt should be recorded

  Scenario: Failed login attempt is recorded when the PIN used is expired / not in list
    Given I have entered a pin that has expired
    Then I should not be logged in
    And the login attempt should be recorded

  @wip
  Scenario: Session is recorded once logged in
    Given I have logged in
    Then a session ID token should be stored