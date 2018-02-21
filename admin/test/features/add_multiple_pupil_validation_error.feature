@add_multiple_pupil_validation @wip
Feature: Add Multiple Pupil validation Error

  Background:
    Given I am logged in
    And I am on the add multiple pupil page


  @multiple_pupil_upload
  Scenario: Uploading a CSV file with less than 5 columns
    And I Upload a CSV file with four columns to add Multiple Pupil
    Then I can see the error message for uploading multiple pupil 'Rows must contain exactly 5 commas / 6 columns'

  @multiple_pupil_upload
  Scenario: Uploading a CSV file with only 1 row
    And I Upload a CSV file with 1 row to add Multiple Pupil
    Then I can see the error message for uploading multiple pupil 'Must contain at least two rows of data'

  Scenario: Upload button disabled when no csv is uploaded
    Then the upload button should be disabled

  @multiple_pupil_upload
  Scenario: Uploading a CSV file with duplicate UPN from the uploaded file
    And I Upload a CSV file with duplicate UPN within uploaded file to add Multiple Pupil
    Then I can see the error message for uploading multiple pupil 'Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet.'


  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong Gender format
    And I Upload a CSV file with wrong gender format to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong gender for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with empty first name and lastname
    And I Upload a CSV file with empty first name and last name to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for empty first name and last name for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with special character in first name and lastname
    And I Upload a CSV file with special character in first name and last name to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for special charchter in first name and last name for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong month for Date of Birth
    And I Upload a CSV file with wrong month for date of birth format to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    And I can see the validation error for wrong month for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong day for Date of Birth
    And I Upload a CSV file with wrong day for date of birth format to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    And I can see the validation error for wrong day for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong year for Date of Birth
    And I Upload a CSV file with wrong year for date of birth format to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    And I can see the validation error for wrong year for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong year for Date of Birth
    And I Upload a CSV file with future date of birth to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    And I can see the validation error for future date of birth for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with duplicate UPN from attendance register
    And I Upload a CSV file with duplicate UPN from attendance register to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for duplicate UPN from attendance register for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with empty UPN
    And I Upload a CSV file with empty UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for empty UPN for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong letter for at 1st Char for UPN
    And I Upload a CSV file with wrong letter for at 1st Char for UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong letter for at 1st Char for UPN for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong LA code for UPN
    And I Upload a CSV file with wrong LA code for UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong LA code for UPN for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong letter for 6th Char for UPN
    And I Upload a CSV file with wrong 6th char for UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong 6th char for UPN for multiple pupil upload

  @multiple_pupil_upload @multiple_pupil_csv_download
  Scenario: Uploading a CSV file with wrong letter for 13th Char for UPN
    And I Upload a CSV file with wrong 13th char for UPN to add Multiple Pupil
    When I download the Multiple Pupil upload CSV file with error
    Then I can see the validation error for wrong 13th char for UPN for multiple pupil upload