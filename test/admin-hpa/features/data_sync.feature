Feature: Data Sync

  Scenario: Answers of a check are synced correctly
    Given my check has been marked
    When the data sync function has run
    Then the answers should be synced to the DB correctly

  Scenario Outline: Marking of a check is synced correctly
    Given I my check has been marked with <expected_mark> correct answers
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

