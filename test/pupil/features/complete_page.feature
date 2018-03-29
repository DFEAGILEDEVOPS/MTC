@complete_page
Feature: Complete page

  Scenario: Completion page has a heading
    Given I am on the complete page
    Then I should see a complete page heading

  Scenario: Complete page has text
    Given I am on the complete page
    Then I should see some text stating i have completed the check

  Scenario: Choosing to restart the check takes you back to the start page
    Given I am on the complete page
    When I choose to sign out
    Then I should be taken back to the sign in page
