@generate_pupil_pins
Feature: Generate Pupil PINs

  @no_pin
  Scenario: Generate Pins Landing page displays heading and info section
    Given I have signed in with teacher2
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

  Scenario: Sticky banner is not displayed if I deselect all pupil
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I deselect all pupils from Generate Pin Page
    Then I should not see a sticky banner

  Scenario: Sticky banner displays pupil count on Generate Pin page
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I select multiple pupils from Generate Pin Page
    Then the sticky banner should display the pupil count

  Scenario: Sticky banner displays total pupil count for Generate Pins when all pupil is selected
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I select all pupils for Generate pin
    Then the sticky banner should display the total pupil count on Generate Pin Page

  @no_pin
  Scenario: Cancel returns user to Generate Pupil Pin Landing page if there are no pupil with pins
    Given I am logged in
    And I am on Generate pins Pupil List page
    And I select a Pupil from Generate Pin page
    When I choose to cancel
    Then I should be taken to Generate Pupil Pins Page

  Scenario: Cancel returns user to Generated Pin page if there are pupils with activepins
    Given I have generated a pin for a pupil
    And I select a Pupil to Generate more pins
    When I choose to cancel
    Then I should be taken to Generated Pins Page

  Scenario: Pupil pins should consist of 5 characters
    Given I have generated a pin for a pupil
    Then the pin should consist of 4 characters

  Scenario: Generated pupil pins are stored in the DB alongside the pupil
    Given I have generated a pin for a pupil
    Then the pin should be stored against the pupil

  Scenario: Pupil pins must be generated from the specified pool of characters
    Given I have generated pin for all pupil
    Then all pupil pins should be generated from the specified pool of characters

  @no_pin
  Scenario: Multiple pins can be generated simultaneously
    Given I have generated pins for multiple pupils
    Then each pin should be displayed next to the pupil its assigned to

  Scenario: Pupil pin is unique across all of the school's pupil records at the time it is generated
    Given I have generated a pin for a pupil
    Then the pupil pin should be unique

  Scenario: School Password is displayed on Generated Pin Page
    Given I have generated a pin for a pupil
    Then I should see the school password for teacher1

  Scenario: School Password info is displayed on Generated Pin Page
    Given I have generated a pin for a pupil
    Then I should see information for Pupil pin and School password

  Scenario: Download Pin option is displayed on Generated Pin Page
    Given I have generated a pin for a pupil
    Then I should see link to download all pupil pins

  Scenario: School password should consist of 8 characters
    Given I have generated a pin for a pupil
    Then the school password should consist of 8 characters

  Scenario: School password should not contain charachter q
    Given I have generated a pin for a pupil
    Then the school password should not contain charachter 'q'

  Scenario: School Password must be generated from the specified pool of characters
    Given I have generated a pin for a pupil
    Then school password should be generated from the specified pool of characters