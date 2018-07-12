@download_pupil_check_data
Feature:
  As a test developer
  In order to verify pupil check
  I want to download pupil check data


  Background:
    Given I am logged in with a test developer

  Scenario: Download Pupil Check Data page display information as per the design
    When I am on the download pupil check data page
    Then download pupil check data page display information as per the design
