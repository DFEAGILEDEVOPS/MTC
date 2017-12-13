@wip @attendance_register
Feature: Attendance register

  As a head teacher
  I need to review the MTC attendance register
  so I can confirm the attendance of pupils for a multiplication check

  Scenario: Attendance register page shows empty when there are no results
    Given there are no answers in database
    When I am on the attendance register page
    Then I see an empty attendance register page

  Scenario: View results
    Given I have populated some results in database
    When I am on the attendance register page
    Then I see the attendance register

  Scenario: Users can logout from results page
    Given I am on the attendance register page
    When I decide to logout from attendance page
    Then I am taken back to the login page

  Scenario: Headteacher confirms the attendance of each pupil
    Given there are pupils who attended the check