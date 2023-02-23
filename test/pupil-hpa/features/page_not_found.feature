@page_not_found
Feature: Page not found page

  Scenario: Page not found for unhandled url
    Given I have navigated to an unhandled url
    Then the page not found page is displayed
    And I should see a link to return to the MTC homepage

