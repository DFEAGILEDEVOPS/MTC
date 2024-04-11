@pupil_register_feature
Feature:
  As part of test development
  I want to be able to register a pupil
  So that I can make sure all the pupils at the school are already present in MTC

  Scenario: Register pupil page has all the pupil displayed and sorted by surname
    Given I am logged in
    When I am on the Pupil Register page
    Then I should see on Pupil register page that all the pupils who are registered are displayed and sorted by lastname

  Scenario: Sorting Pupil list by Name
    Given I am logged in
    And I am on the Pupil Register page
    And I should see on Pupil register page that all the pupils who are registered are displayed and sorted by lastname
    When I click on the Name heading
    Then I should see on the Pupil Register page that all pupils are displayed in descending order of lastname

  Scenario: Add single pupil link takes to add pupil page
    Given I am logged in
    When I am on the Pupil Register page
    And I click the Add Pupils link from Pupil Register page
    Then I should be taken to the add pupil page

  Scenario: Adding a pupil will appear in the list
    Given I am logged in
    When I am on the Pupil Register page
    And I choose to add a pupil by clicking Add Pupils link
    Then I should see the added pupil details on the pupil register page

  @remove_all_groups_hook
  Scenario: Group column is populated with group name when pupil is part of a group
    Given I have a group of pupils
    When I am on the Pupil Register page
    Then I should see each pupil row have the group column populated with the group name

  @remove_all_groups_hook
  Scenario: Pupils with no group have no entry in the group column
    Given I have a group of pupils
    When I am on the Pupil Register page
    Then any pupils not part of a group should not have an entry for group

  Scenario: Pupil count is displayed on the pupil register page
    Given I am logged in
    When I am on the Pupil Register page
    Then I should see a count of pupils in the school

  @pupil_register_v2_hook
  Scenario: Pupil register data stored in redis
    Given I am logged in
    And I am on the Pupil Register page
    Then I should see the pupil register data stored in redis

  Scenario: Pupils can be searched for by name
    Given I am logged in
    When I am on the Pupil Register page
    Then I can search for a pupil via name

  Scenario: Pupils can be searched for by upn
    Given I am logged in
    When I am on the Pupil Register page
    Then I can search for a pupil via upn

  Scenario: Optional Columns can be shown
    Given I have a group of pupils
    And I am on the Pupil Register page
    And I choose to show the UPN column
    Then the optional columns along with the additional pupil info is added to the register table

  Scenario: Pupil register can be sorted by name
    Given I have a group of pupils
    And I am on the Pupil Register page with optional fields displayed
    And I choose to sort the pupil register by name in reverse order
    Then the pupil register is sorted by name in reverse order

  Scenario: Pupil register can be sorted by dob in order of oldest to newest
    Given I have a group of pupils
    And I am on the Pupil Register page with optional fields displayed
    And I choose to sort the pupil register by dob in order of oldest to newest
    Then the pupil register is sorted by dob in order of oldest to newest

  Scenario: Pupil register can be sorted by dob in order of newest to oldest
    Given I have a group of pupils
    And I am on the Pupil Register page with optional fields displayed
    And I choose to sort the pupil register by dob in order of newest to oldest
    Then the pupil register is sorted by dob in order of newest to oldest

  Scenario: Pupil register can be sorted by UPN in z-a order
    Given I have a group of pupils
    And I am on the Pupil Register page with optional fields displayed
    And I choose to sort the pupil register by upn in z-a order
    Then the pupil register is sorted by upn in z-a order

  Scenario: Pupil register can be sorted by UPN in a-z order
    Given I have a group of pupils
    And I am on the Pupil Register page with optional fields displayed
    And I choose to sort the pupil register by upn in a-z order
    Then the pupil register is sorted by upn in a-z order

  Scenario: Pupil register can be sorted by Group in z-a order
    Given I have pupils in 2 groups
    And I am on the Pupil Register page with optional fields displayed
    And I choose to sort the pupil register by group in z-a order
    Then the pupil register is sorted by group in z-a order

  Scenario: Pupil register can be sorted by Group in a-z order
    Given I have pupils in 2 groups
    And I am on the Pupil Register page with optional fields displayed
    And I choose to sort the pupil register by group in a-z order
    Then the pupil register is sorted by group in a-z order

  Scenario: Group column can be hidden
    Given I am logged in
    When I am on the Pupil Register page
    Then I can choose to hide the Group column



