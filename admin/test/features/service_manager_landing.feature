Feature: Service manager homepage

  Scenario: Service Manager are taken to the service manager homepage
    Given I have signed in with service-manager
    Then I should be taken to the service manager homepage

  Scenario: Service manager sees their name on the school homepage
    Given I have signed in with service-manager
    Then I should see service-manager's name

  @travis
  Scenario: Service manager should be given the option to manage check windows
    Given I am logged in with a service manager
    Then I should be given the option to manage check windows

  @travis
  Scenario: Service manager should be given the option to adjust question timings
    Given I am logged in with a service manager
    Then I should be given the option to adjust question timings

  @travis
  Scenario: Service manager should be given the option to view progress reports
    Given I am logged in with a service manager
    Then I should be given the option to view progress reports

  @travis
  Scenario: Service manager should be given the option to manage retake requests
    Given I am logged in with a service manager
    Then I should be given the option to manage retake requests

  Scenario: Service manager should be given some guidance
    Given I am logged in with a test developer
    Then I should be given some guidance
