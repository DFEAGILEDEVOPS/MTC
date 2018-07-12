@complete_page
Feature: Complete page

  Scenario: Completion page matches design
    Given I am on the complete page
    Then I should see the complete page which matches design
    When I choose to sign out
    Then I should be taken back to the sign in page
