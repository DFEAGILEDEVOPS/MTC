@add_multiple_pupils
Feature: Add Multiple Pupil

  Background:
    Given I am logged in
    And I am on the add multiple pupil page

  Scenario: Add Multiple Pupil Landing page displays heading and sub heading section
    Then I should see a heading for the Add Multiple pupils
    And I can see sub heading 'Download template' on Add Multiple Pupil Page
    And I can see sub heading 'Upload file' on Add Multiple Pupil Page

  Scenario: Add Multiple Pupil Landing page displays info for adding multiple pupil
    Then I can see the Info message on adding Multiple Pupils

  Scenario: Add Multiple Pupil Landing page have option to upload CSV file for adding multiple pupil
    Then I should have the option to choose a csv file for adding multiple pupil

  Scenario: Users can navigate back to the pupil register page from Add Multiple Pupil Page
    When I decide to go back
    Then I should be taken to the Pupil register page
    And I should see no flash message displayed

  @multiple_pupil_upload
  Scenario: User can see success message after uploading valid file for adding multiple pupil
    When I Upload a valid CSV file to add Multiple Pupil
    Then I should be taken to the Pupil register page
    And I should see a flash message for the multiple pupil upload

  @multiple_pupil_upload
  Scenario: User can see new pupil in the list after uploading valid file for adding multiple pupil
    When I Upload a valid CSV file to add Multiple Pupil
    Then I should be taken to the Pupil register page
    And I can see the new pupil in the list

  @multiple_pupil_upload
  Scenario: User uploading a CSV files with errors can see error message
    When I Upload a CSV file with errors to add Multiple Pupil
    And I can see the error message for adding Multiple Pupil

  @multiple_pupil_upload
  Scenario: User uploading a CSV files with errors can see a link to download error file
    When I Upload a CSV file with errors to add Multiple Pupil
    And I can see link to download Error File
