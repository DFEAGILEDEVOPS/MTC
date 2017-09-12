Feature: Service manager homepage

  Scenario: Test developers are taken to the service manager homepage
    Given I have signed in with test-developer
    Then I should be taken to the service manager homepage

  Scenario: Service manager sees their name on the school homepage
    Given I have signed in with test-developer
    Then I should see test-developer's name

  Scenario: Service manager should be given the option to manage check windows
    Given I am logged in with a test developer
    Then I should be given the option to manage check windows

  Scenario: Service manager should be given the option to adjust question timings
    Given I am logged in with a test developer
    Then I should be given the option to adjust question timings

  Scenario: Service manager should be given the option to view progress reports
    Given I am logged in with a test developer
    Then I should be given the option to view progress reports

  Scenario: Service manager should be given the option to manage retake requests
    Given I am logged in with a test developer
    Then I should be given the option to manage retake requests

  Scenario: Service manager should be given some guidance
    Given I am logged in with a test developer
    Then I should be given some guidance
