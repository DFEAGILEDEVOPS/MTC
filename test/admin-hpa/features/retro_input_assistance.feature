Feature:
  Retrospective input assistance

  Scenario: Input assistance can be added retrospectively
    Given I have completed the check
    When I add an input assistant after taking the check
    Then the input assistant should be stored

  Scenario: Exclude pupils with active restart
    Given I submitted pupils for Restart
    When I am on the retro input page
    Then searching for the pupil with an active restart does not return any results

  Scenario: 2nd checks can have input assistant added retrospectively
    Given I submitted pupils for Restart
    And Pupil has taken a 2nd check
    When I am on the retro input page
    Then I should be able to add input assistant against the second check

  Scenario: 3rd checks can have input assistant added retrospectively
    Given I submitted pupils for Restart
    And Pupil has taken a 3rd check
    When I am on the retro input page
    Then I should be able to add input assistant against the third check

