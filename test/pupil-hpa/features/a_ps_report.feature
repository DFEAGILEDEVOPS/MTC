@ps_report @weekend
Feature:
  PS Report

  Scenario: Pupils that have completed the check with 25 correct answers are included in the report
    Given I have completed the check
    When the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table

  Scenario: Pupils that have completed the check with AA are included in the report
    Given I logged in with user with access arrangement 'Audible time alert, Input assistance'
    And I complete the check
    When the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table

  Scenario Outline: Pupils that have a reason for not taking a check are included in the report
    Given I have marked a pupil as not taking check with the <reason> reason
    When the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table

    Examples:
      | reason                                         |
      | Incorrect registration                         |
      | Left school                                    |
      | Unable to access                               |
      | Working below expectation                      |
      | Just arrived and unable to establish abilities |

  Scenario: Pupils who have been annulled are included in the report
    Given I have annulled a pupil
    When the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table
    And I should see the correct code for an annulled pupil

  Scenario: Form mark is null for Pupils who have been annulled
    Given I have completed the check
    When the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table
    But the pupil has been annulled
    When the data sync and ps report function has run
    And I should see that form mark is set to null

  Scenario: Pupils who have had their annulled removed return to previous state
    Given I have removed a pupils annulment
    When the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table
    And I should see the annulment has been removed

  Scenario: Pupils who have a reason for not taking a check and have an annulment removed are returned to previous state
    Given I have marked a pupil as not taking check with the Left school reason
    And this is code is stored
    When I remove a previously applied annulment
    And the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table

  Scenario Outline: Pupils who have taken a restart are included in the ps report
    Given I have completed the check
    When I consume a restart using <reason> and complete the check a second time
    And the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table
    And the latest check is recorded

    Examples:
      | reason               |
      | Loss of internet     |
      | IT issues            |
      | Classroom disruption |
      | Did not complete     |

  Scenario: Pupils who have taken the max number of restarts are included in the report with only their latest check
    Given I have completed the check
    When I consume a restart using Loss of internet and complete the check a second time
    And I consume another restart using IT issues and complete the check a third time
    And the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table

  Scenario: Pupil PS report record is updated whenever the function is run
    Given I have generated a pin for a pupil
    And I see the ps report record for the pupil
    When the pupil completes the check
    And the data sync and ps report function has run
    Then the ps report record should be updated with all the check details

  Scenario Outline: PS report
    Given I have completed the check with only <correct_answers> correct answers
    When the data sync and ps report function has run
    Then I should see a record for the pupil in the ps report table

    Examples:
      | correct_answers |
      | 0               |
      | 1               |
      | 3               |
      | 5               |
      | 8               |
      | 13              |
      | 21              |

  Scenario: AA can be added after pin is generated
    Given I have generated a live pin
    When I add an AA arrangement
    And complete the check
    Then the PS report should include the AA for the pupil


  Scenario: Restart bug
    Given I generated a pin after applying a restart
    But the pin expires
    When I generate a new pin and complete the check
    And the data sync and ps report function has run
    Then I should see the restart reason in the ps report record

  Scenario: Only first input used when a duplicate question is shown
    Given I have completed a check with duplicate questions
    And the data sync and ps report function has run
    Then I should see the ps report showing the first input

  Scenario: Test schools do not have a ps report record
    Given I have completed the check for a pupil attending a test school
    When the data sync and ps report function has run for the test school
    Then I should not see any records for the test school

  Scenario: AttemptId is not set when a pin has expired and the pupil has been set to NTC
    Given I have generated a live pin
    But the pin expires
    When the pupil is set to not taking the check
    And the data sync and ps report function has run
    Then the AttemptId for the ps record for that pupil is set to null

  Scenario: Device is set to null when no device information is collected
    Given I have completed a check that has no device information
    When the data sync and ps report function has run
    Then I should see the device is set to null
