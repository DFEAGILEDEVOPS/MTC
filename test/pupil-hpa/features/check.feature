@check_feature
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

  Scenario: Users can enter answers by using their physical keyboard
    Given I have started the check
    Then I can answer the question using their physical keyboard

  @local_storage_hook
  Scenario: Users can complete the test using the on screen keyboard and the check data is stored in the DB
    Given I have started the check using the keyboard
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

  @check_started_hook
  Scenario Outline: Pupil Score is calculated after the check is completed
    Given I have just completed the check with only <correct_answers> correct answers
    Then my score should be calculated as <correct_answers> and stored

    Examples:
      | correct_answers |
      | 0               |
      | 1               |
      | 3               |
      | 5               |
      | 8               |
      | 13              |
      | 21              |
      | 25              |


  Scenario: JWT token contains correct information
    Given I have just completed the check with only 5 correct answers
    When I decode the JWT token
    Then it should contain the correct information
