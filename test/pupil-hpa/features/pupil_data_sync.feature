Feature:
  Data sync

  Scenario Outline: Answers events and inputs all match up
    Given I have completed the check with only <correct_answers> correct answers
    When the data sync function has run
    Then all answers events and inputs match

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
