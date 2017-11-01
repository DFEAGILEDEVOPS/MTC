@pupil_pin
Feature: Generate Pupil PINs


  Scenario: Generate Pins Landing page displays heading and info section
    Given I am logged in
    When I navigate to generate pupil pins page
    Then I should see a heading for the Generate Pupil Pins
    And I can see the info message for generating the pupil pin

  Scenario Outline: Generate Pins Pupil List Page displays lists of Pupils
    Given I have signed in with <teacher>
    And I navigate to generate pupil pins page
    When I click Generate PINs button
    Then I should see a list of pupils sorted by surname in 'ascending' order on Generate Pins List Page

  Examples:
  | teacher  |
  | teacher1 |
  | teacher2 |
  | teacher3 |
  | teacher4 |

  Scenario: Generate Pins Pupil List page do not display pupil with active pin
    Given I am logged in
    And I have a pupil with active pin
    And I am on the generate pupil pins page
    When I click Generate PINs button
    Then I cannot see this pupil in the list of Pupil on Generate Pin list page

  Scenario: Generate Pins Pupil List Page do not display pupil not taking check
    Given I have a pupil not taking the check
    And I am on the generate pupil pins page
    When I click Generate PINs button
    Then I cannot see this pupil in the list of Pupil on Generate Pin list page

  Scenario: Sorting Pupil list on Generate Pins page
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I click on the Pupil heading
    Then I should see a list of pupils sorted by surname in 'descending' order on Generate Pins List Page

  Scenario: Pupils can be selected by a checkbox on Generate Pin page
    Given I am logged in
    And I am on Generate pins Pupil List page
    Then I should be able to select them via a checkbox on Generate Pin page

  Scenario: Teachers can select all pupils on Generate Pin page
    Given I am logged in
    And I am on Generate pins Pupil List page
    Then I should have a option to select all pupils on Generate Pin page

  Scenario: Sticky banner is not displayed on on Generate Pin page if no pupil are selected
    Given I am logged in
    And I am on Generate pins Pupil List page
    Then I should not see a sticky banner

  Scenario: Sticky banner is displayed on on Generate Pin page when a pupil is selected
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I select a Pupil from Generate Pin page
    Then I should see a sticky banner

  Scenario: Sticky banner displays pupil count on Generate Pin page
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I select multiple pupils from Generate Pin Page
    Then the sticky banner should display the pupil count

  Scenario: Cancel returns user to Generate Pin Landing page
    Given I am logged in
    And I am on Generate pins Pupil List page
    And I select a Pupil from Generate Pin page
    When I choose to cancel
    Then I should be taken to Generate Pins Page

  Scenario: Pupil pins should consist of 5 characters
    Given I have generated a pin for a pupil
    Then the pin should consist of 5 characters

  @new_work @local
  Scenario: Generated pupil pins are stored in the DB alongside the pupil
    Given I have generated a pin for a pupil
    Then the pin should be stored against the pupil

  Scenario: Pupil pins must be generated from the specified pool of characters
    Given I have generated a pin for a pupil
#    Given I have generated pin for all pupil
    Then all pupil pins should be generated from the specified pool of characters

  Scenario: Multiple pins can be generated simultaneously
    Given I have generated pins for multiple pupils
    Then each pin should be displayed next to the pupil its assigned to

  Scenario: Pupil pin is unique across all of the school's pupil records at the time it is generated
    Given I have generated a pin for a pupil
    Then the pupil pin should be unique