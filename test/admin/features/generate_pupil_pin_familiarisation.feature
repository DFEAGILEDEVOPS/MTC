@generate_pupil_pins_familiarisation @reset_all_pins
Feature: Generate Pupil PINs Familiarisation

  @reset_all_pins
  Scenario: Generate pupil pin familiarisation is rendered as per design
    Given I have signed in with teacher2
    When I navigate to generate pupil pins familiarisation page
    Then I should see generate pin familiarisation overview page as per design
    And I can see instructions for generating pin for familiarisation

  @wip
  Scenario: Generate Pins familiarisation Pupil List page display pupil with active pin
    Given I am logged in
    And I have a pupil with active pin
    And I am on the generate pupil pins familiarisation page
    When I click Generate PINs button
    Then I can see this pupil in the list of Pupil on Generate Pin familiarisation list page

  Scenario: Generate Pins familiarisation Pupil List Page display pupil not taking check
    Given I have a pupil not taking the check
    And I am on the generate pupil pins familiarisation page
    When I click Generate PINs button
    Then I can see this pupil in the list of Pupil on Generate Pin familiarisation list page

  Scenario: Sorting Pupil list on Generate Pins familiarisation page
    Given I am logged in
    And I am on familiarisation generate pins pupil List page
    When I click on the Pupil heading
    Then I should see a list of pupils sorted by surname in 'descending' order on familiarisation Generate Pins List Page

  Scenario: Pupils can be selected by a checkbox on Generate Pin familiarisation page
    Given I am logged in
    And I am on familiarisation generate pins pupil List page
    Then I should be able to select them via a checkbox on familiarisation Generate Pin page
    And I should have a option to select all pupils on familiarisation Generate Pin page

  Scenario: Sticky banner is not displayed on on Generate Pin familiarisation page if no pupil are selected
    Given I am logged in
    And I am on familiarisation generate pins pupil List page
    Then I should not see a sticky banner

  Scenario: Sticky banner is displayed on on Generate Pin familiarisation page when a pupil is selected
    Given I am logged in
    And I am on familiarisation generate pins pupil List page
    When I select a Pupil from familiarisation Generate Pin page
    Then I should see a sticky banner

  Scenario: Sticky banner is not displayed if I deselect all pupil on Generate Pin familiarisation page
    Given I am logged in
    And I am on familiarisation generate pins pupil List page
    When I deselect all pupils from familiarisation Generate Pin Page
    Then I should not see a sticky banner

  Scenario: Sticky banner displays pupil count on Generate Pin familiarisation page
    Given I am logged in
    And I am on familiarisation generate pins pupil List page
    When I select multiple pupils from familiarisation Generate Pin Page
    Then the sticky banner should display the pupil count

  Scenario: Sticky banner displays total pupil count for Generate familiarisation Pins when all pupil is selected
    Given I am logged in
    And I am on familiarisation generate pins pupil List page
    When I select all pupils for Generate pin
    Then the sticky banner should display the total pupil count on Generate Pin Page

  Scenario: Familiarisation Pupil pins should consist of 4 characters
    Given I have generated a familiarisation pin for a pupil
    Then the pin should consist of 4 characters