Feature:
  As a test developer
  I want to have a central page as a starting point
  So that I can easily get to where I need to go

  Background:
    Given I am logged in

  Scenario: profile page has a logo
    Given I am on the profile page
    Then I should see a logo

  Scenario: profile page has title
    Given I am on the profile page
    Then I should see a title

  Scenario: profile page has link to manage check forms
    Given I am on the profile page
    Then I should see a link to manage check forms

  Scenario: Manage check forms link takes you to the manage check forms page
    Given I am on the profile page
    When I choose to manage check forms
    Then I should be taken to the manage check forms page
