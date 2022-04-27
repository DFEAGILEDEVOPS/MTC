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

  Scenario: Service message should be visible on school homepage
    Given I have created a service message
    When I navigate to school home page as a teacher
    Then service message is displayed as per design

  Scenario: Service manager can edit a service message
    Given I have previously created a service message
    When I edit the existing service message
    Then the service message should be updated

  Scenario Outline: Service manager can choose the colour of the border
    Given I have created a service message with a <colour> border
    When I navigate to school home page as a teacher
    Then service message is displayed as per design

    Examples:
      | colour |
      | blue   |
      | red    |
      | green  |
      | orange |

