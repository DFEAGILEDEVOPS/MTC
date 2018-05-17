@service_manager_landing
Feature: Service manager homepage

  Scenario: Service Manager are taken to the service manager homepage
    Given I have signed in with service-manager
    Then I should be taken to the service manager homepage

  Scenario: Service manager sees their name on the school homepage
    Given I have signed in with service-manager
    Then I should see service-manager's name

  Scenario: Service manager should be given the option to manage check windows
    Given I am logged in with a service manager
    Then I should be given the option to manage check windows

  Scenario: Service manager should be given the option to upload pupil census data
    Given I am logged in with a service manager
    Then I should be given the option to upload pupil census data

  Scenario: Service manager should be given the option to adjust settings on pupil check
    Given I am logged in with a service manager
    Then I should be given the option to adjust settings on pupil check

  Scenario: Service manager should be given the option to adjust settings on school pages
    Given I am logged in with a service manager
    Then I should be given the option to adjust settings on school pages

  Scenario: Service manager should be given the option to manage access arrangements
    Given I am logged in with a service manager
    Then I should be given the option to manage access arangements

  Scenario: Service manager should be given the option to manage restart requests
    Given I am logged in with a service manager
    Then I should be given the option to manage restart requests

  Scenario: Service manager should be given the option to view progress reports
    Given I am logged in with a service manager
    Then I should be given the option to view progress reports

  Scenario: Service manager should be given some guidance
    Given I am logged in with a test developer
    Then I should be given some guidance
