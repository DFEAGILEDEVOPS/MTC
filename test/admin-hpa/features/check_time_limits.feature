@check_time_limits_feature @timer_reset_hook
Feature: Check time limit tests
  I want to be able to vary the time limit for the MTC check
  As a STA Researcher
  So that I can measure the affect this setting has in varying scenarios on the validity of MTC as an assessment

  Background:
    Given I am on the admin page

  Scenario: Check time limit has a default value of 30 minutes
    When I am on the check settings page
    Then I should see that maximum length of check is set to 30 minutes

  Scenario: The 'maximum length of check' contains the value it was last populated with
    When I have updated the maximum length of check to 60 minutes
    Then I should see that maximum length of check is set to 60 minutes

  Scenario Outline: Error message is shown when the input for maximum length of check is not valid
    When I attempt to enter maximum length of check as <value> minutes
    Then I should see a validation error for maximum length of check

    Examples: values
      | value |
      | zzz   |
      | -3    |
      | 9     |
      | 91    |

  Scenario: An audit record is created that defines the date and date from which the new
  value of the maximum length of check was applied
    When I update the maximum length of check from 30 to 35 minutes
    Then I should see a record that has date and time of the maximum length of check change to 35 in database

  Scenario: A historic record is appended for every change of maximum length of check
    When I update the maximum length of check from 40 to 60 minutes
    Then I should see a historic record appended for maximum length of check change to 60 in the database

  Scenario: Cancel returns user to service manager home page
    When I am on the check settings page
    And I click cancel
    Then I should be returned to the admin page
