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
