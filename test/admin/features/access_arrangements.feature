@access_arrangements
Feature: Access Arrangements

  Scenario: Access Arrangements page is displayed as per the design
    Given I have signed in with teacher2
    And I navigate to access arrangements page
    Then the access arrangements page is displayed as per the design