@wip
Feature:
  As a development team
  We would like to show key stakeholders a prototype of the app
  In order to gain feedback and show progress

  Scenario: Sign in page has a STA logo
    Given I am on the sign in page
    Then I should see a STA logo

  Scenario: Sign in has a heading
    Given I am on the sign in page
    Then I should see a sign in page heading

  Scenario: Sign in has intro text
    Given I am on the sign in page
    Then I should see some sign in page intro text

  Scenario: Sign in page has a sign in button
    Given I am on the sign in page
    Then I should see a sign in button
