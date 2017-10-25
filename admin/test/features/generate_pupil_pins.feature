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
    Then I should see a list of pupils sorted by surname on Generate Pins List Page

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
    And I navigate to generate pupil pins page
    And I click Generate PINs button
    When I click on the Pupil heading
    Then I should see on the Generate Pin Pupil List page that all pupils are displayed in descending order of lastname
