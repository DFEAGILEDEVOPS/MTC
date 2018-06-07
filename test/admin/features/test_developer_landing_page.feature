@test_developer_landing
Feature: Test Developer Landing page

  Scenario: Test developers are taken to the service manager homepage
    Given I have signed in with test-developer
    Then I should be taken to the Test Developer homepage

  Scenario: Test Developers sees their name on the school homepage
    Given I have signed in with test-developer
    Then I should see test-developer's name

  Scenario: Test Developers should be given the option to upload and view forms
    Given I have signed in with test-developer
    Then I should be given the option to upload and view forms

  Scenario: Test Developers should be given the option to assign forms to check windows
    Given I have signed in with test-developer
    Then I should be given the option to assign forms to check windows

  Scenario: Test Developers should be given the option to download pupil check data
    Given I have signed in with test-developer
    Then I should be given the option to download pupil check data

  Scenario: Test Developers should be given some guidance
    Given I have signed in with test-developer
    Then I should be given some guidance
