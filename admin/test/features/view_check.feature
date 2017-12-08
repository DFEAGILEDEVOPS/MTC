@view_check
Feature:
  As a test developer
  I want to preview the check form i have upload
  So I can ensure i have not made any mistakes

  Background:
    Given I am logged in with a test developer

  Scenario: Users can view an uploaded check
    Given I have uploaded a check form
    When I choose to preview the check form questions
    Then I should see the questions exactly as intended

  Scenario: Users have the option delete a form if it has not been assigned
    Given I have uploaded a check form
    When I choose to preview the check form questions
    Then I should be given the option to delete the form

  Scenario: Users have the option to go back after viewing the form to the manage check form page
    Given I have uploaded a check form
    When I choose to preview the check form questions
    Then I should be given the option to go back to the manage check form page

  Scenario: Users can go back to the manage check form page
    Given I am viewing a check form that is unassigned to a check window
    When I choose to go back
    Then I am taken to the view forms page

  Scenario: Users can delete a unassigned check form
    Given I am viewing a check form that is unassigned to a check window
    When I choose to delete it
    Then it should be removed from the list of available checks

  @wip
  Scenario: Users can not delete a assigned check form
    Given I am viewing a check form that is assigned to a check window
    Then I should not be able to delete it

