@device_information
Feature: Record device information in local storage and persist to DB

  Scenario: Device information recorded contains battery, cpu, navigation, network, screen information
    Given I am on the instructions page
    Then I should see device information populated in local storage

  Scenario: Device information is persisted to the DB
    Given I am on the complete page
    Then the device information should be persisted to the DB


