@loading_page_feature @generate_live_pin_hook
Feature: Loading Page

  Scenario: Warm up questions start after a 2 second delay
    Given I have read the instructions
    When I choose to start the warm up questions
    Then I should have 3 seconds before I see the first question

  Scenario: Next button appears after 2 second delay
    Given I logged in with user with access arrangement 'Pause - 'next' button between questions'
    Given I have read the instructions and seen the settings page
    When I choose to start the warm up questions
    When I have been idle for 2 seconds
    Then I should see the next button

  @wip
  Scenario: Idle modal appears after delay
    Given I logged in with user with access arrangement 'Pause - 'next' button between questions'
    Given I have read the instructions and seen the settings page
    Given I choose to start the warm up questions
    Given I complete the warm up questions using the numpad
    Given I start the questions
    Then I should see the next button
    Then I should not see the modal dialog
    Then I should see the modal dialog after the idle timeout expires

  @wip
  Scenario: Redirect occurs when check timer expires
    Given I logged in with user with access arrangement 'Pause - 'next' button between questions'
    Given I have read the instructions and seen the settings page
    Given I choose to start the warm up questions
    Given I complete the warm up questions using the numpad
    Given I start the questions
    Then I should see the next button
    Then I should be redirected when the check time limit expires
