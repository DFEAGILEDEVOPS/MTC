@add_multiple_pupils
Feature: Add Multiple Pupil

  Background:
    Given I am logged in
    And I am on the add multiple pupil page

  Scenario: Add Multiple Page landing page displays information about landing page
    Then I can see the landing page as per the design

  Scenario: Users can navigate back to the pupil register page from Add Multiple Pupil Page
    When I decide to go back
    Then I should be taken to the Pupil register page
    And I should see no flash message displayed

  @multiple_pupil_upload
  Scenario: User can see success message after uploading valid file for adding multiple pupil
    When I Upload a valid CSV file to add Multiple Pupil
    Then I should be taken to the Pupil register page
    And I should see a flash message for the multiple pupil upload
    And I can see the new pupil in the list

  @multiple_pupil_upload
  Scenario: User uploading a CSV files with errors can see error message
    When I Upload a CSV file with errors to add Multiple Pupil
    Then I can see the error message for adding Multiple Pupil
    And I can see link to download Error File
