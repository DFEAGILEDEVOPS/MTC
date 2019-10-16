@service_manager_message
Feature: Service manager message

  Scenario: Service manager can manage service messages
    Given I am on the manage service message page
    Then it should match the design

  Scenario: Service manager can create a service message
    Given I am on the create service message page
    When I submit the form with the service message I require
    Then the service message should be saved

  Scenario: Service manager can delete a service message
    Given I have created a service message
    When I decide to delete the message
    Then it should be removed from the system

  Scenario: Service manager should only be able to create one message
    Given I have created a service message
    Then I should not be able to create another


