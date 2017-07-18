Feature: Time between questions
  I want to be able to vary the time given to pupils between questions during the check
  As a STA Researcher
  So that I can measure the affect this setting has in varying scenarios on the validity of MTC as an assessment

  Background:
    Given I am on the admin page

  Scenario: Time between questions has a default value of 2 seconds
    Given I am on the check settings page
    Then I should see that Time between questions is set to default 5 seconds

  Scenario: The 'Time between questionst' contains the value it was last populated with
    Given I have updated the Time between questions to 7 seconds
    When I am on the check settings page
    Then I should see that Time between questions is set to 5 seconds


  Scenario Outline: Error message is shown when the input for Time between questions is not valid
    Given I am on the check settings page
    When I attempt to enter Time between questions as "<value>" seconds
    Then I should see a validation error for Time between questions

    Examples: values
      | value |
      | zzz   |
      | -3    |
      | 0     |

  Scenario: Time between questions can only have 2 decimal places
    Given I am on the check settings page
    When I attempt to enter Time between questions as 5.555
    Then I should see that Time between questions is set to 5.56 seconds

  Scenario: An audit record is created that defines the date and date from which the new
  value of the Time between questions was applied
    When I update the Time between questions from 7 to 5 seconds
    Then I should see a record that has date and time of the change in database

  Scenario: A historic record is appended for every change of Time between questions
    When I update the Time between questions from 5 to 7 seconds
    Then I should see a historic record appended in the database