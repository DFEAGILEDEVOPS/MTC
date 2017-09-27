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

  Scenario: Pupil reason page has an explanation of the reasons
    Given I am on the pupil not taking check page
    When I want to add a reason
    Then I should see a section that explains the reasons

  Scenario Outline: Pupils are sorted by surname by default
    Given I have signed in with <teacher>
    When I want to add a reason for pupils not taking a check
    Then I should see a list of pupils sorted by surname

    Examples:
      | teacher  |
      | teacher1 |
      | teacher2 |
      | teacher3 |
      | teacher4 |

  Scenario: Pupils can be selected by a checkbox
    Given I am on the pupil reason page
    Then I should be able to select them via a checkbox

  Scenario: Teachers can select all pupils
    Given I am on the pupil reason page
    Then I should have a option to select all pupils

  Scenario: Pupils can be sorted via reason
    Given I am on the pupil reason page
    Then I should be able to sort them via their reason for absence

  @manual
  Scenario: Clicking on pupil name selects the pupil
    Given I am on the pupil reason page
    Then I should be able to select the pupils name to check the check box

  @manual
  Scenario: Teachers can select all pupils
    Given I am on the pupil reason page
    Then I should be able to select all pupils