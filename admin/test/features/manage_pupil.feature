Feature:
  As part of test development
  I want to be able to manage a pupil
  So that I can make sure all the pupils at the school are already present in MTC

  Scenario: Manage pupil page has all the pupil displayed and sorted by surname
    Given I am logged in
    When I am on the manage pupil page
    Then I should see that all the pupils who are registered are displayed and sorted by lastname

  Scenario: Add pupil link on manage pupil link takes to add pupil page
    Given I am logged in
    When I am on the manage pupil page
    And I click the Add Pupils link
    Then I should be taken to the add pupil page

  Scenario: Adding a pupil will appear in the list
    Given I am logged in
    When I am on the manage pupil page
    And I choose to add a pupil by clicking Add Pupils link
    Then I should see the added pupil details on the manage pupils page

  Scenario: Teachers have option to print pins
    Given I am logged in
    When I am on the manage pupil page
    Then I should have the option to print pins

  Scenario: Expired pin is showed as pin expired
    Given I have a pupil whose pin is expired
    When I am on the manage pupil page
    Then I should see the pupil's pin as PIN expired

  Scenario: Pupil whose pin is not generated will show as n/a
    Given I have a pupil whose pin is not generated
    When I am on the manage pupil page
    Then I should see the pupil's pin as n/a

  @add_a_pupil
  Scenario: Pupil pins should consist of 5 characters
    Given I have generated a pin for a pupil
    Then the pin should consist of 5 characters

  @add_a_pupil
  Scenario: Generated pupil pins are stored in the DB alongside the pupil
    Given I have generated a pin for a pupil
    Then the pin should be stored against the pupil

  @add_a_pupil
  Scenario: Pin generated pupil dont have check box next to them
    Given I have generated a pin for a pupil
    Then there should not be a checkbox against the pupil

  @add_a_pupil
  Scenario: Pupil pins must be generated from the specified pool of characters
    Given I am on the manage pupil page
    When I choose to generate pupil pins for all pupils
    Then all pupil pins should be generated from the specified pool of characters

  @add_5_pupils
  Scenario: Multiple pins can be generated simultaneously
    Given I am on the manage pupil page
    When I have generated pins for multiple pupils
    Then each pin should be displayed next to the pupil its assigned to

  @add_a_pupil
  Scenario: Pupil pin is unique across all of the school's pupil records at the time it is generated
    Given I have generated a pin for a pupil
    Then the pupil pin should be unique

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

