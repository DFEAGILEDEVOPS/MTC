@test
Feature: Header and Footer tests

  Scenario: Sign in has a global header
    Given I am on the SPA sign in page
    Then I should see a global header

  Scenario: Sign in has a feedback text
    Given I am on the SPA sign in page
    Then I should see a feedback text on the page

  Scenario: Sign in has a footer link
    Given I am on the SPA sign in page
    Then I should see a footer with a link to crown copyright

  Scenario: Welcome page has footer link
    Given I am on the welcome page
    Then I should see a footer with a link to crown copyright

  Scenario: Welcome page has feedback text
    Given I am on the welcome page
    Then I should see a feedback text on the page

  Scenario: Welcome page has global header
    Given I am on the welcome page
    Then I should see a global header

  Scenario: Instruction page has global header
    Given I am on the instructions page
    Then I should see a global header

  Scenario: Instruction page has footer link
    Given I am on the instructions page
    Then I should see a footer with a link to crown copyright

  Scenario: Instruction page has feedback text
    Given I am on the instructions page
    Then I should see a feedback text on the page

  Scenario: Complete page has footer link
    Given I am on the complete page
    Then I should see a footer with a link to crown copyright

  Scenario: Complete page has feedback text
    Given I am on the complete page
    Then I should see a feedback text on the page

  Scenario: Complete page has global header
    Given I am on the complete page
    Then I should see a global header