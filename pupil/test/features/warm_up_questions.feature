Feature: Warm up questions
  As a pupil I want some warm up questions
  So that I can prepare myself for the check

  Scenario: Warm up page has a heading
    Given I am on the warm up intro page
    Then I should see a warm up page heading

  Scenario: Warm up page has intro text
    Given I am on the warm up intro page
    Then I should see some warm up page intro text

  Scenario: Warm up questions start after a 2 second delay
    Given I am on the warm up check page
    Then I should have 2 seconds before i see the first question

  Scenario: Users can complete the warm up questions using the on screen keyboard
    Given I am on the warm up check page
    Then I should be able to use the on screen keyboard to complete the warm up questions
    And the warm up questions start and end dates are saved in database

  Scenario: Warm up page check has a 5 second timer for each question
    Given I am on the warm up check page
    Then I should see that i have 5 seconds to answer the warm up question

  Scenario: Warm up page check gives users 5 seconds to answer the question and then moves on
    Given I am on the warm up check page
    And I could not answer the question within 5 seconds
    Then I should be moved to the next question after 5 seconds

  Scenario: Warm up page check Users do not have to wait 5 seconds if they submit an answer before the time is up
    Given I am on the warm up check page
    And I could answer the warm up page question within 5 seconds
    Then I should be moved to the next question



