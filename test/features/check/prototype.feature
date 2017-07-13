@wip
Feature:
  As a development team
  We would like to show key stakeholders a prototype of the app
  In order to gain feedback and show progress

  Scenario: Starting the checks gives users 2 seconds before the first question is displayed
    Given I have logged in
    When I start the check
    Then I should have 2 seconds before i see the first question
