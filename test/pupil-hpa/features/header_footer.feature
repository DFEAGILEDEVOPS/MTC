@header_footer
Feature: Header and Footer tests

  Scenario: Sign in has a global header
    Given I am on the sign in page
    Then I should see a global header

  Scenario: Welcome page has global header
    Given I am on the welcome page
    Then I should see a global header

  Scenario: Instruction page has global header
    Given I am on the instructions page
    Then I should see a global header

  Scenario: Complete page has global header
    Given I am on the complete page
    Then I should see a global header
