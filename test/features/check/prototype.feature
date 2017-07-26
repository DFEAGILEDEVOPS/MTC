Feature:
  As a development team
  We would like to show key stakeholders a prototype of the app
  In order to gain feedback and show progress

  Scenario: Starting the checks gives users 2 seconds before the first question is displayed
    Given I am logged in on pupil page
    When I start the check
    Then I should have 2 seconds before i see the first question

  Scenario: Question time limit is reflected in the check page
    Given I am on the admin page
    And I have updated the Question time limit to 10 seconds
    And I am logged in on pupil page
    When I start the check
    Then I should see the Question time limit is set to 10 seconds in the check page

  Scenario: Time between questions is reflected in the check page
    Given I am on the admin page
    Given I have updated the Time between questions to 3 seconds
    And I am logged in on pupil page
    When I start the check
    Then I should see the Time between questions is set to 3 seconds in the check page
