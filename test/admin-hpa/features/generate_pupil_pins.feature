@generate_pupil_pins_feature @deactivate_all_test_check_window_hook
Feature: Generate Pupil PINs

  Scenario: Generate Pins overview page displays heading and info section
    Given I am logged in
    When I am on the generate pupil live pins overview page
    Then generate pin overview page for live check is displayed as per design

  Scenario Outline: Generate Pins Pupil List Page displays lists of Pupils
    Given I have signed in with <teacher>
    When I am on the generate pupil live pins page
    Then I should see a list of pupils sorted by surname in 'ascending' order on Generate Pins List Page

  Examples:
  | teacher  |
  | teacher1 |
  | teacher2 |
  | teacher3 |


  Scenario: Only 1 Live pin allowed per pupil
    Given I have generated a live pin for a pupil
    When I am on the generate pupil live pins page
    Then I cannot see this pupil in the list of Pupil on Generate Pin list page

  Scenario: Generate Pins Pupil List Page do not display pupil not taking check
    Given I have a pupil not taking the check
    When I am on the generate pupil live pins page
    Then I cannot see this pupil in the list of Pupil on Generate Pin list page

  Scenario: Sorting Pupil list on Generate Pins page
    Given I am logged in
    And I am on the generate pupil live pins page
    When I click on the Pupil heading
    Then I should see a list of pupils sorted by surname in 'descending' order on Generate Pins List Page

  Scenario: Pupils can be selected by a checkbox on Generate Pin page
    Given I am logged in
    And I am on the generate pupil live pins page
    Then I should be able to select them via a checkbox on Generate Pin page

  Scenario: Teachers can select all pupils on Generate Pin page
    Given I am logged in
    And I am on the generate pupil live pins page
    Then I should have a option to select all pupils on Generate Pin page

  Scenario: Sticky banner is not displayed on on Generate Pin page if no pupil are selected
    Given I am logged in
    And I am on the generate pupil live pins page
    Then I should not see a sticky banner

  Scenario: Sticky banner is displayed on on Generate Pin page when a pupil is selected
    Given I am logged in
    And I am on the generate pupil live pins page
    When I select a Pupil from Generate Pin page
    Then I should see a sticky banner

  Scenario: Sticky banner is not displayed if I deselect all pupil
    Given I am logged in
    And I am on the generate pupil live pins page
    When I deselect all pupils from Generate Pin Page
    Then I should not see a sticky banner

  Scenario: Sticky banner displays pupil count on Generate Pin page
    Given I am logged in
    And I am on the generate pupil live pins page
    When I select multiple pupils from Generate Pin Page
    Then the sticky banner should display the pupil count

  Scenario: Sticky banner displays total pupil count for Generate Pins when all pupil is selected
    Given I am logged in
    And I am on the generate pupil live pins page
    When I select all pupils for Generate pin
    Then the sticky banner should display the total pupil count on Generate Pin Page

  Scenario: Cancel returns user to Generate Pupil Pin Landing page if there are no pupil with pins
    Given I am logged in
    And I am on the generate pupil live pins page
    And I select a Pupil from Generate Pin page
    When I choose to cancel
    Then I should be taken to Generate Pupil Pins Page

  Scenario: Cancel returns user to Generated Pin page if there are pupils with activepins
    Given I have generated a live pin for a pupil
    And I select a Pupil to Generate more pins
    When I choose to cancel
    Then I should be taken to Generated Pins Page

  Scenario: Check Form is assigned when Pin is generated and the Pin consist of 4 characters
    Given I have generated a live pin for a pupil
    Then the pin should consist of 4 characters
    And the pin should be stored against the pupil
    And check form should be assigned to the pupil

  @manual
  Scenario: Pupil pins must be generated from the specified pool of characters
    Given I have generated pin for all pupil
    Then all pupil pins should be generated from the specified pool of characters

  Scenario: Multiple pins can be generated simultaneously
    Given I have generated pins for multiple pupils
    Then each pin should be displayed next to the pupil its assigned to

  Scenario: Pupil pin is unique across all of the school's pupil records at the time it is generated
    Given I have generated a live pin for a pupil
    Then the pupil pin should be unique

  Scenario: Generated Pin Page is displayed as per the design
    Given I have generated a live pin for a pupil
    Then I should see generated pin page as per design
    And the displayed school password is generated as per the requirement

  Scenario: Pupil should not appear in the list of pupil for not taking the check after Live pin is generated
    Given I have generated a live pin for a pupil
    When I want to add a reason for pupils not taking a check
    Then I cannot see pupil in the list for pupil for not taking check

  @remove_all_groups_hook @pupil_not_taking_check_hook
  Scenario: Pupils can be filtered by group
    Given I have a group of pupils
    When I choose to filter via group on the generate pins page
    Then I should only see pupils from the group
    And I should be able to see a count of pupils
    And I should be able to generate pins for all pupils in this group

  @remove_all_groups_hook @pupil_not_taking_check_hook
  Scenario: Pupils not taking the check should not be in filtered group list
    Given I have a pupil not taking the check
    And that pupil is apart of a group
    When I choose to filter via group on the generate pins page
    Then I should only see pupils available for taking the check
    And I should be able to generate pins for all pupils in this group

  @remove_all_groups_hook
  Scenario: Group is no longer present in the filter when all pupils in the group have had a pin generated
    Given I have generated pins for all pupils in a group
    Then I can no longer use this group to filter on the generate pins page

  @remove_all_groups_hook @pupil_not_taking_check_hook @manual
  Scenario: Groups reappear when their are available pupils for pin generation
    Given I have generated pins for all pupils in a group
    When a pupil becomes available for pin generation again
    Then I should be able to filter by groups on the generate pins page

  @redis @no_active_check_window @manual
  Scenario: Generate Pin Overview page display error if there is no active check window
    Given I am on the generate pupil pins page after logging in with a teacher
    Then I should see an error message stating the service is unavailable

  Scenario: Generate pins page has related content
    Given I am logged in
    When I am on the generate pupil live pins overview page
    Then I should see related content on the generate pins page

  Scenario: Live Pin Overview page is displayed after generating some pin as per design
    Given I have generated a live pin for a pupil
    And I am on the generate pupil live pins overview page
    Then generated pin overview page for live check with some pin generated is displayed as per design

  @remove_all_groups_hook @empty_new_school_hook
  Scenario: Generate pins for 255 pupils
    Given I want to generate pins for a group of 255 pupils with a teacher
    When I select all 255 pupils
    Then I should be able to generate pins

  Scenario: Users are recorded against the checks they create
    Given I have generated a live pin for a pupil
    Then the user should be stored to identify who created the check

