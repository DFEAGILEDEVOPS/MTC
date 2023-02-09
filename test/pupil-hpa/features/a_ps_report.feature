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
      | Absent during check window                     |
      | Left school                                    |
      | Unable to access                               |
      | Working below expectation                      |
      | Just arrived and unable to establish abilities |

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
