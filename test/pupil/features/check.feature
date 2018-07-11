@check
Feature: Check questions

  Scenario: Loading page should display for configured number of seconds
    Given I have started the check
    Then the loading page should display for the configured number of seconds

  Scenario: Check page has a question and a timer
    Given I have started the check
    When the loading screen has expired
    Then I should see the question and timer

  Scenario: Question should display for configured number of seconds
    Given I have started the check
    When the loading screen has expired
    Then the question should display for the configured number of seconds
    And I should be moved to the next question

  Scenario: Route remains /check during the check
    Given I have started the check
    Then the route remains the same

  Scenario: Users can enter answers by using their phsyical keyboard
    Given I have started the check
    Then I can answer the question using their phsyical keyboard

  @local_storage
  Scenario: Users can complete the test using the on screen keyboard and the check data is stored in the DB
    Given I have started the check
    Then I should be able to use the on screen keyboard to complete the test
    And I should see all the data from the check stored in the DB

  Scenario: Users can correct their answer
    Given I have started the check
    When I have entered an incorrect answer
    Then I should be able to correct my answer if i am quick enough

  Scenario: Check loading page states the question number
    Given I am on the check loading page
    Then I should see the number of the next questions

  Scenario: MTC check start page shows number of questions
    Given I am on the MTC check start page
    Then I should see the number of questions
