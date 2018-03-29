@instructions
Feature:
  As a pupil I want a page of instructions
  So I know what to do

  Scenario: Instructions page should have a heading
    Given I am on the instructions page
    Then I should see a heading

  Scenario: Instructions page has a bulleted list of instructions
    Given I am on the instructions page
    Then I should see a bulleted list of instructions

  Scenario: Insturctions page should have a button to start the warm up questions
    Given I am on the instructions page
    Then I should see a start button

# Removed for the March trial
#  Scenario: Instructions page should display the timings between questions dynamically
#    Given I am on the instructions page
#    Then I should see the timings between questions
