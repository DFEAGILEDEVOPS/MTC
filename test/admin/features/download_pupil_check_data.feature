@download_pupil_check_data
Feature:
  As a test developer
  In order to verify pupil check
  I want to download pupil check data


  Background:
    Given I am logged in with a test developer

  Scenario: Download Pupil Check Data page has a heading
    When I am on the download pupil check data page
    Then I should see a heading for the download pupil check data page

  Scenario: Download Pupil Check Data page has information about the downloading pupil check data
    When I am on the download pupil check data page
    Then I should see some information about the download pupil check data