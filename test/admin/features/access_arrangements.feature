@access_arrangements @wip @feature_toggle
Feature: Access Arrangements

  Scenario: Access Arrangements page is displayed as per the design
    Given I have signed in with teacher2
    And I navigate to access arrangements page
    Then the access arrangements page is displayed as per the design

  Scenario: Select access arrangements page matches design
    Given I am on the select access arrangements page
    Then I should see the select access arrangements page matches design
