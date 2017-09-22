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

  Scenario: Pupil reason page has a heading
    Given I am on the pupil not taking check page
    When I want to add a reason
    Then I should see a heading on the page

  Scenario: Pupil reason page has reasons
    Given I am on the pupil not taking check page
    When I want to add a reason
    Then I should see set of reasons I can choose

  Scenario: Pupil reason page has back to top option
    Given I am on the pupil not taking check page
    When I want to add a reason
    Then I should see a back to top option

  Scenario: Pupil reason page has generate pins option
    Given I am on the pupil not taking check page
    When I want to add a reason
    Then I should see a option to generate pins
