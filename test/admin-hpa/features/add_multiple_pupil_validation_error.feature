@add_multiple_pupil_validation_feature @multiple_pupil_upload_hook
Feature: Add Multiple Pupil validation Error

  Background:
    Given I am logged in
    And I am on the add multiple pupil page

  @multiple_pupil_upload_hook
  Scenario: Uploading a CSV file with less than 5 columns
    And I Upload a CSV file with four columns to add Multiple Pupil
    Then I can see the error message for uploading multiple pupil 'Use a file with exactly 6 columns'

  @multiple_pupil_upload_hook
  Scenario: Uploading a CSV file with only 1 row
    And I Upload a CSV file with 1 row to add Multiple Pupil
    Then I can see the error message for uploading multiple pupil 'Use a file with at least 2 pupils'

  Scenario: Uploading a CSV file with only more than 300 rows
    And I Upload a CSV file with more than 300 rows
    Then I can see the error message for uploading multiple pupil 'Upload a file with no more than 300 rows of data.'

  @multiple_pupil_upload_hook
  Scenario: Uploading a CSV file with duplicate UPN from the uploaded file
    And I Upload a CSV file with duplicate UPN within uploaded file to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for duplicate UPN in the spreadsheet for multiple pupil upload

  @multiple_pupil_upload_hook
  Scenario: Uploading a CSV file with empty UPN
    And I Upload a CSV file with empty UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for empty UPN for multiple pupil upload

  @multiple_pupil_upload_hook
  Scenario: Uploading a CSV file with wrong letter for at 1st Char for UPN
    And I Upload a CSV file with wrong letter for at 1st Char for UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong letter for at 1st Char for UPN for multiple pupil upload

  @multiple_pupil_upload_hook
  Scenario: Uploading a CSV file with wrong LA code for UPN
    And I Upload a CSV file with wrong LA code for UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong LA code for UPN for multiple pupil upload

  @multiple_pupil_upload_hook
  Scenario: Uploading a CSV file with wrong letter for 6th Char for UPN
    And I Upload a CSV file with wrong 6th char for UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong 6th char for UPN for multiple pupil upload

  @multiple_pupil_upload_hook
  Scenario: Uploading a CSV file with wrong letter for 13th Char for UPN
    And I Upload a CSV file with wrong 13th char for UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong 13th char for UPN for multiple pupil upload


  @multiple_pupil_upload
  Scenario: Uploading a CSV file with wrong Gender format
    And I Upload a CSV file with wrong gender format to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong gender for multiple pupil upload

  @multiple_pupil_upload
  Scenario: Uploading a CSV file with empty first name and lastname
    And I Upload a CSV file with empty first name and last name to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for empty first name and last name for multiple pupil upload

  @multiple_pupil_upload
  Scenario: Uploading a CSV file with special character in first name and lastname
    And I Upload a CSV file with special character in first name and last name to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for special charchter in first name and last name for multiple pupil upload

  @multiple_pupil_upload
  Scenario: Uploading a CSV file with wrong month for Date of Birth
    And I Upload a CSV file with wrong month for date of birth format to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    And I can see the validation error for wrong month for multiple pupil upload

  @multiple_pupil_upload
  Scenario: Uploading a CSV file with wrong day for Date of Birth
    And I Upload a CSV file with wrong day for date of birth format to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    And I can see the validation error for wrong day for multiple pupil upload

  @multiple_pupil_upload
  Scenario: Uploading a CSV file with wrong year for Date of Birth
    And I Upload a CSV file with wrong year for date of birth format to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    And I can see the validation error for wrong year for multiple pupil upload

  @multiple_pupil_upload
  Scenario: Uploading a CSV file with wrong year for Date of Birth
    And I Upload a CSV file with future date of birth to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    And I can see the validation error for future date of birth for multiple pupil upload

  Scenario: Users must upload a file in CSV format
    When I Upload a invalid format file to add Multiple Pupil
    Then I should see an error stating that the file must be of CSV format

  Scenario: Users must follow the format of the template
    When I Upload a CSV file with the columns in the incorrect order
    Then I should see an error stating that the columns must be of the same order

  Scenario: 11 year old pupils cannot be added
    When I attempt to upload a valid CSV file to add Multiple Pupil with a pupil aged 11
    Then I should see an error with the upload stating the DOB is invalid

  Scenario: 10 year old pupils cannot be added
    When I attempt to upload a valid CSV file to add Multiple Pupil with a pupil aged 10
    Then I should see an error with the upload stating the DOB is invalid

  Scenario: 9 year old pupils can be added
    When I attempt to upload a valid CSV file to add Multiple Pupil with a pupil aged 9
    Then I should be taken to the Pupil register page
    And I should see a flash message for the multiple pupil upload
    And I can see the new pupils added to the list

  Scenario: 8 year old pupils can be added
    When I attempt to upload a valid CSV file to add Multiple Pupil with a pupil aged 8
    Then I should be taken to the Pupil register page
    And I should see a flash message for the multiple pupil upload
    And I can see the new pupils added to the list

  Scenario: 7 year old pupils can be added
    When I attempt to upload a valid CSV file to add Multiple Pupil with a pupil aged 7
    Then I should be taken to the Pupil register page
    And I should see a flash message for the multiple pupil upload
    And I can see the new pupils added to the list

  Scenario: 6 year old pupils cannot be added
    When I attempt to upload a valid CSV file to add Multiple Pupil with a pupil aged 6
    Then I should see an error with the upload stating the DOB is invalid

  Scenario: Users have to upload a CSV file
    When I decide to click on upload without selecting a file
    Then I should see an error stating i need to upload a CSV

