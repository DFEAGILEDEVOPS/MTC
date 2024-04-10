@time_between_questions_feature @timer_reset_hook
Feature: Time between questions
  I want to be able to vary the time given to pupils between questions during the check
  As a STA Researcher
  So that I can measure the affect this setting has in varying scenarios on the validity of MTC as an assessment

  Background:
    Given I am on the admin page

  Scenario: Time between questions has a default value of 3 seconds
    When I am on the check settings page
    Then I should see that time between questions is set to 3 seconds

  Scenario: The 'Time between questions' contains the value it was last populated with
    When I have updated the time between questions to 4 seconds
    Then I should see that time between questions is set to 4 seconds

  Scenario Outline: Error message is shown when the input for Time between questions is not valid
    When I attempt to enter time between questions as <value> seconds
    Then I should see a validation error for Time between questions

    Examples: values
      | value |
      | zzz   |
      | -3    |
      | 7     |

  Scenario: Time between questions can only have 2 decimal places
    And I have updated the time between questions to 3.555 seconds
    Then I should see that time between questions is set to 3.56 seconds

  Scenario: An audit record is created that defines the date and date from which the new
  value of the Time between questions was applied
    When I update the time between questions from 2 to 4 seconds
    Then I should see a record that has date and time of the Time between questions change to 4 in database

  Scenario: A historic record is appended for every change of Time between questions
    When I update the time between questions from 4 to 2 seconds
    Then I should see a historic record appended for Time between questions change to 2 in the database
