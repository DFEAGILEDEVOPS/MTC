@wip @manage_pupil
Feature:
  As part of test development
  I want to be able to manage a pupil
  So that I can make sure all the pupils at the school are already present in MTC

  Scenario: Teachers have option to print pins
    Given I am logged in
    When I am on the manage pupil page
    Then I should have the option to print pins

  @wip
  Scenario: Expired pin is showed as pin expired
    Given I have a pupil whose pin is expired
    When I am on the manage pupil page
    Then I should see the pupil's pin as PIN expired

  Scenario Outline: School password is displayed on manage pupil page
    Given I have logged in with <teacher>
    When I want to manage the pupils
    Then I should see the school password for <teacher>
    And I should see the date for the password

    Examples:
      | teacher  |
      | teacher1 |
      | teacher2 |
      | teacher3 |
      | teacher4 |

  @manual
  Scenario: Teachers can select all pupils
    Given I am on the manage pupil page
    When I have selected all pupils
    Then I should see all pupils are selected

  @manual
  Scenario: Teachers can deselect all pupils
    Given I am on the manage pupil page
    And I have selected all pupils
    When I deselect all pupils
    Then I should see no pupils are selected

  @wip
  Scenario: Score of pupils who have taken a check is displayed next to their name
    Given I am on the manage pupil page
    Then I should be able to see pupil scores next to their name

  @wip
  Scenario: 8 character daily school password is displayed
    Given I am on the manage pupil page
    Then I should see a daily school password

  @wip
  Scenario: Teachers can print the pupil pins
    Given I am on the manage pupil page
    And I have generated pins for multiple pupils
    When I decide to print the pupil pin information
    Then I should be able to see the pupil pins that where generated

