@4_digit @wip
Feature:
  As a enforcer
  I want to ensure users are authenticated via a 4 digit pin
  So I can be certain of no maladministration

  Scenario: Pins are generated using a character pool
    Given 4 digit pins have been generated
    Then they should only consist of numbers between 0 and 9

  Scenario: Number of login attempts are recorded
    Given I have attempted to login 5 times
    Then the number of attempts should be recorded

  Scenario: The details of login are recorded
    Given I have logged in
    Then the details of the login should be recorded

  @wip
  Scenario: Validation error is displayed when PIN is invalid
    Given I have entered an invalid pin
    Then I should see a validation error

  Scenario: Error is displayed when no details are entered
    Given I have not entered any sign in details
    Then I should see a error page

  @wip
  Scenario: Validation error is displayed when I have entered DOB with letters
    Given I have used alpha character for my DOB
    Then I should see a validation error

  @wip
  Scenario: Validation error is displayed when I have used numbers for my surname
    Given I have entered a number as my surname
    Then I should see a validation error

  Scenario: Failed login attempt is recorded when the PIN is missing
    Given I have not entered a pin
    Then I should not be logged in
    And the login attempt should be recorded

  Scenario: Failed login attempt is recorded when the PIN is present but the data is missing
    Given I have not entered a valid pin
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