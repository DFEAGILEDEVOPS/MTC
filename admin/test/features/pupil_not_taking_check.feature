Feature:
  Pupil not taking check

  Scenario: Pupil not taking check page has a heading
    Given I am on the pupil not taking check page
    Then I should see the heading

  Scenario: Pupil not taking check page has some informational text
    Given I am on the pupil not taking check page
    Then I should see the info text

  Scenario: Pupil not taking check page allows teachers to add a reason
    Given I am on the pupil not taking check page
    Then I should see a way to add a reason

  Scenario: Pupil not taking check page has a back to top button
    Given I am on the pupil not taking check page
    Then I should be able to go back to the top

  Scenario: Pupil not taking check has a link to generate pupil pins
    Given I am on the pupil not taking check page
    Then I should see a way to generate pins
