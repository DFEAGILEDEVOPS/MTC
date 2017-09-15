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
    Then I should see the added pupil details on the manage pupils page

