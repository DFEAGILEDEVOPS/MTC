@wip
Feature: Configurable time limits

  Background:
    Given I am on the admin page

  Scenario: Question time limit has a default value of 5 seconds
    Given I am on the check settings page
    Then I should see that Question time limit is set to default 5 seconds

  Scenario: