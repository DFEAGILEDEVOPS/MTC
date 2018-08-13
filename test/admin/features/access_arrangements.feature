@access_arrangements @feature_toggle
Feature: Access Arrangements

  Scenario: Access Arrangements page is displayed as per the design
    Given I have signed in with teacher2
    And I navigate to access arrangements page
    Then the access arrangements page is displayed as per the design

  Scenario: Select access arrangements page matches design
    Given I am on the select access arrangements page
    Then I should see the select access arrangements page matches design

  Scenario: search suggestion is displayed after 2 charcheters of search term
    Given I am on the select access arrangements page
    When I search for pupil 'pu'
    Then I can see auto search list

  Scenario: Auto search returns the pupil when it is searched for
    Given I search for the pupil for access arrangement
    Then I can see the pupil returned in auto search list
