Feature: Add Multiple Pupil

  Background:
    Given I am logged in
    And I am on the add multiple pupil page

  Scenario: Add Multiple Pupil Landing page
    Then I should see a heading for the Add Multiple pupils
    And I can see sub heading 'Download example' on Add Multiple Pupil Page
    And I can see sub heading 'Upload file' on Add Multiple Pupil Page
    And I can see the Info message on adding Multiple Pupils
    And I should have the option to choose a csv file for adding multiple pupil

  Scenario: Users can navigate back to the pupil register page from Add Multiple Pupil Page
    When I decide to go back
    Then I should be taken to the Pupil register page
    And I should see no flash message displayed

  Scenario: User can add Multiple Pupil by uploading valid file
    When I Upload a valid CSV file to add Multiple Pupil
    Then I should be taken to the Pupil register page
    And I should see a flash message for the multiple pupil upload
    And I can see the new pupil in the list
    And I delete the Add Multiple Pupil CSV file

  Scenario: User uploading a CSV files with errors
    When I Upload a CSV file with errors to add Multiple Pupil
    And I can see the error message for adding Multiple Pupil
    And I can see link to download Error File
    And I delete the Add Multiple Pupil CSV file
