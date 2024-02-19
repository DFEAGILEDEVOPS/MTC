Feature:
  Check Validator

  Scenario: Checks should be submitted with exactly 25 answers
    Given a pupil has completed the check with less than 25 answers
    Then I should see an error stating validation failed as there are 24 answers

  Scenario: Answers should be strings
    Given a pupil has completed the check with an answer that is not a string
    Then I should see an error stating validation failed as answers must be strings

  Scenario: Payload should include an audit log
    Given a pupil has completed the check with no audit logs
    Then I should see an error stating validation failed as there is no audit log

  Scenario: Answers property must be an array
    Given a pupil has completed the check with answers that are not contained in an array
    Then I should see an error stating validation failed as answers are not an array

  Scenario: Audit property must be an array
    Given a pupil has completed the check with the audit log is not contained in an array
    Then I should see an error stating validation failed as the audit log is not an array

  Scenario: CheckCode property must be a UUID
    Given a pupil has completed the check with a check code that is not a UUID
    Then I should see an error stating validation failed as the check code is not a UUID

  Scenario: Config property must be an object
    Given a pupil has completed the check with the config property not being a object
    Then I should see an error stating validation failed as the config property has to be an object

  Scenario: Inputs property must be an array
    Given a pupil has completed the check with the inputs property not being a array
    Then I should see an error stating validation failed as the inputs property has to be an array

  Scenario: Check.config.practice property must be false
    Given a pupil has completed the check with the practice property is set to true
    Then I should see an error stating validation failed as the practice property is set to true

  Scenario: Pupil property must be an object
    Given a pupil has completed the check with the pupil property not being an object
    Then I should see an error stating validation failed as the pupil property is not a object

  Scenario: Questions property must be an array
    Given a pupil has completed the check with the questions are not contained in an array
    Then I should see an error stating validation failed as the questions are not an array

  Scenario: School property must be an object
    Given a pupil has completed the check with the school property not being an object
    Then I should see an error stating validation failed as the school property is not a object

  Scenario: Tokens property must be an object
    Given a pupil has completed the check with the tokens property not being an object
    Then I should see an error stating validation failed as the tokens property is not a object

  Scenario: Check version is set to version 3
    Given a pupil has completed a check
    Then I should see the check is recieved and is set to version 3

