@upload_pupil_census_feature @serial
Feature:
  Upload Pupil Census

  Scenario: Pupil census page matches design
    Given I am on the upload pupil census page
    Then the pupil census should match design

  Scenario: Pupil census can be submitted
    Given I am on the upload pupil census page
    When I have chosen a file to submit
    Then I should see the file uploaded
    And I should see the completed status

  Scenario: Pupils uploaded via census are visible in the pupil register
    Given I can see pupils that exist in the pupil register
    When I upload pupils via the census upload
    Then the newly uploaded pupils are visible in the pupil register list

  Scenario: Pupils uploaded via census are visible in the pupil register when a temporary upn is used
    Given I can see pupils that exist in the pupil register
    When I upload pupils via the census upload using a temporary upn
    Then the newly uploaded pupils are visible in the pupil register list

  @wip
  Scenario: Error is displayed when uploading a pupil census data with duplicate UPN
    Given I am on the upload pupil census page
    When I have chosen a file with 'duplicate upn' to submit
    Then I should see the error status for the duplicate upn

  @wip
  Scenario: Error is displayed when uploading a pupil census data with empty last name
    Given I am on the upload pupil census page
    When I have chosen a file with 'empty last name' to submit
    Then I should see the error status for the empty last name

  @wip
  Scenario: Error is displayed when uploading a pupil census data with empty first name
    Given I am on the upload pupil census page
    When I have chosen a file with 'empty first name' to submit
    Then I should see the error status for the empty first name

  @wip
  Scenario: Error is displayed when uploading a pupil census data with empty Gender
    Given I am on the upload pupil census page
    When I have chosen a file with 'empty gender' to submit
    Then I should see the error status for the empty gender

  Scenario: Pupil census has to be of CSV format
    Given I am on the upload pupil census page
    When I have chosen a file to submit that is not a CSV
    Then I should see an error stating the file type must be CSV

  Scenario: Service manager has to upload a file
    Given I am on the upload pupil census page
    When I have not chosen a file to submit
    Then I should see an error stating I need to select a file to upload
