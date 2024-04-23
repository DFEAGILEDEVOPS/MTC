@device_information_feature
Feature: Record device information in local storage and persist to DB

  Scenario: Device information recorded contains battery, cpu, navigation, network, screen information
    Given I am on the instructions page
    Then I should see device information populated in local storage

  Scenario: Device information is persisted to the DB
    Given I am on the complete page
    Then the device information should be persisted to the DB

  Scenario: App counter increments with every completed check
    Given I have completed 2 checks
    Then the app counter should be set to 2

  @manual
  Scenario: App counter is reset when user refreshes a page
    Given I have refreshed a page during the check
    Then the app counter should be set to 0



