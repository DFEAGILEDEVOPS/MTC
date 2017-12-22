#These tests are having issues with travis
@timer_reset @question_time_limits @wip
Feature: Question time limit tests
  I want to be able to vary the time limit used for the questions in an MTC check
  As a STA Researcher
  So that I can measure the affect this setting has in varying scenarios on the validity of MTC as an assessment

  Background:
    Given I am on the admin page

  Scenario: Question time limit has a default value of 5 seconds
    When I am on the check settings page
    Then I should see that question time limit is set to 5 seconds

  Scenario: The 'Question time limit' contains the value it was last populated with
    When I have updated the question time limit to 6 seconds
    Then I should see that question time limit is set to 6 seconds

  Scenario Outline: Error message is shown when the input for Question time limit is not valid
    When I attempt to enter question time limit as <value> seconds
    Then I should see a validation error for question time limit

    Examples: values
      | value |
      | zzz   |
      | -3    |
      | 0     |

  Scenario: Question time limit can only have 2 decimal places
    When I have updated the question time limit to 5.5555 seconds
    Then I should see that question time limit is set to 5.56 seconds

  Scenario: An audit record is created that defines the date and date from which the new
  value of the Question time limit was applied
    When I update the question time limit from 7 to 5 seconds
    Then I should see a record that has date and time of the question time limit change to 5 in database

  Scenario: A historic record is appended for every change of Question time limit
    When I update the question time limit from 5 to 7 seconds
    Then I should see a historic record appended for question Time limit change to 7 in the database