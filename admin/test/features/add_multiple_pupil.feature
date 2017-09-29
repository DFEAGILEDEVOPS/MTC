
Feature: Add Multiple Pupil

  Background:
    Given I am logged in

  @wip
  Scenario: Add Multiple Pupil Landing page
    And I am on the add multiple pupil page
    Then I should see a heading for the Add Multiple pupils
    And I can see sub heading 'Download template' on Add Multiple Pupil Page
    And I can see sub heading 'Upload file' on Add Multiple Pupil Page
    And I can see the Info message on adding Multiple Pupils
    And I should have the option to choose a csv file for adding multiple pupil


  Scenario: Users can navigate back to the pupil register page from Add Multiple Pupil Page
    And I am on the add multiple pupil page
    When I decide to go back
    Then I should be taken to the Pupil register page
    And I should see no flash message displayed

   @local
  Scenario: User can add Multiple Pupil by uploading valid file
    And I am on the add multiple pupil page
    When I Upload a valid CSV file to add Multiple Pupil
#    Then I am on the add pupil page
#    And I should see a flash message to state the pupil has been added
    And I delete the Add Multiple Pupil CSV file
