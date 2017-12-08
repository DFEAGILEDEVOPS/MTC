@loading_page
Feature: Loading Page

  Scenario: Warm up questions start after a 2 second delay
    Given I have read the instructions
    When I choose to start the warm up questions
    Then I should have 2 seconds before I see the first question
