Feature: Data Sync

  @new_school
  Scenario Outline: Answers of a check are synced correctly
    Given my check has been marked with <number_of_correct_answers> correct answers
    When the data sync function has run
    Then the answers should be synced to the DB correctly

    Examples:
      | number_of_correct_answers |
      | 25                        |
      | 20                        |
      | 15                        |
      | 10                        |
      | 5                         |
      | 0                         |

  Scenario Outline: Marking of a check is synced correctly
    Given my check has been marked with <expected_mark> correct answers
    When the data sync function has run
    Then the correct mark should be synced to the DB correctly

    Examples:
      | expected_mark |
      | 25            |
      | 20            |
      | 15            |
      | 10            |
      | 5             |
      | 0             |

  Scenario: Events are synced correctly
    Given my check has been marked
    When the data sync function has run
    Then the events should be synced to the DB correctly

  Scenario Outline: Inputs are synced correctly
    Given my check has been completed using a <type>
    When the data sync function has run
    Then the inputs should be synced to the DB correctly

    Examples:
      | type     |
      | mouse    |
      | keyboard |
      | touch    |
      | pen      |
      | unknown  |


  Scenario: Update check status on hard failures
    Given I have check which has resulted in a hard failure
    When the data sync function has run
    Then check should fail processing
    And the pupil should be available for a restart
