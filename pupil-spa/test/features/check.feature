Feature: Check questions

  Scenario: Loading page should display for configured number of seconds
    Given I have started the check
    Then the loading page should display for the configured number of seconds

  Scenario: Check page has a question
    Given I have started the check
    When the loading screen has expired
    Then I should see a question

  Scenario: Question should display for configured number of seconds
    Given I have started the check
    When the loading screen has expired
    Then the question should display for the configured number of seconds

  Scenario: Check page gives users 5 seconds to answer the question and then moves on
    Given I have started the check
    And I could not answer the question within the configured number of seconds
    Then I should be moved to the next question

  Scenario: Route remains /check during the check
    Given I have started the check
    Then the route remains the same

  Scenario: On screen keyboard is displayed on check page
    Given I have started the check
    Then I should see the on screen keyboard

  Scenario: Users can enter answers by using the on screen keyboard
    Given I have started the check
    Then I can answer the question using the on screen keyboard

  Scenario: Users can enter answers by using their phsyical keyboard
    Given I have started the check
    Then I can answer the question using their phsyical keyboard

  Scenario: Users can complete the test using the on screen keyboard
    Given I have started the check
    Then I should be able to use the on screen keyboard to complete the test

  Scenario: Users can correct their answer
    Given I have started the check
    When I have entered an incorrect answer
    Then I should be able to correct my answer if i am quick enough
