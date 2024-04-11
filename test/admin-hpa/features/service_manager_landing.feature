@service_manager_landing_feature
Feature: Service manager homepage

  Scenario: Service Manager are taken to the service manager homepage
    Given I have signed in with service-manager
    Then I should be taken to the service manager homepage
    And the service managers homepage should match design

