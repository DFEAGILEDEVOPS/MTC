@warm_up
Feature: Warm up questions
  As a pupil I want some warm up questions
  So that I can prepare myself for the check

  Scenario: Warm up page has a heading
    Given I am on the warm up intro page
    Then I should see a warm up page heading

  Scenario: Warm up complete page has a heading
    Given I am on the warm up complete page
    Then I should see a warm up complete heading

  Scenario: Warm up complete page allows users to start the check
    Given I am on the warm up complete page
    Then I should see a way to start the check

  Scenario: Users can complete the warm up questions using the on screen keyboard
    Given I am on the warm up check page
    Then I should be able to use the on screen keyboard to complete the warm up questions

  Scenario: Users can complete the warm up questions using the keyboard
    Given I am on the warm up check page
    Then I should be able to use the keyboard to complete the warm up questions

  Scenario: Warm up questions are displayed for the configured number of seconds
    Given I am on the warm up check page
    When the loading screen has expired
    Then the question should display for the configured number of seconds

  Scenario: Warm up page check gives users a defined number of seconds to answer the question and then moves on
    Given I am on the warm up check page
    And I could not answer the question within the configured number of seconds
    Then I should be moved to the next question

  Scenario: Users do not have to wait for the configured time if they submit an answer before the time is up
    Given I am on the warm up check page
    And I could answer the question within the configured time
    Then I should be moved to the next question

  Scenario: Users can correct their answer
    Given I am on the warm up check page
    When I have entered an incorrect answer
    Then I should be able to correct my answer if i am quick enough

  Scenario: Route remains /check during the check
    Given I am on the warm up check page
    Then the route remains the same

  Scenario: Warm up check page has a timer
    Given I am on the warm up check page
    When the loading screen has expired
    Then I should see a timer

  Scenario: Warm up loading page has total number of questions
    Given I am on the warm up intro page
    Then I should see the total number of warm up questions
