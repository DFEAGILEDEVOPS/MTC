@assign_to_check_window
Feature:
  As a test developer
  I want to assign a window for a check form
  So that pupils can sit the check

  Background:
    Given I am logged in with a test developer

  Scenario: Assign check window page has a heading
    Given I am on the assign check window page
    Then I should see a heading for the page

  Scenario: Assign check window page has information about the check form
    Given I am on the assign check window page
    Then I should see some information about the check form

  Scenario: Assign check window page has check windows
    Given I am on the assign check window page
    Then I should see check windows

  @create_new_window
  Scenario: Users can assign a check form to a check window
    Given I have uploaded a check form
    When I have assigned the check form to a check window
    Then the check form should be displayed as being assigned to the check window
    And should show what form is assigned on the upload and view forms pge

  @create_new_window @wip
  Scenario: Users can assign a form to multiple check windows
    Given I have uploaded a check form
    When I have assigned the check form to multiple check windows
    Then the check form should be displayed as being assigned to multiple check windows

  @create_new_window
  Scenario: Users cannot remove assigned forms
    Given I have uploaded a check form
    When I have assigned the check form to a check window
    Then the check form should not be removable

  @create_new_window
  Scenario: Users can remove unassigned forms
    Given I have uploaded a check form
    Then I should be able to remove the check form

  @create_new_window
  Scenario: Users can remove a check assigned to a window
    Given I have assigned a check to a check window
    When I decide i want to remove the check from the check window
    Then the check should be unassigned from that check window

  @create_new_window
  Scenario: Users cant assign the same form to a window
    Given I have assigned a check to a check window
    When I attempt to assign the same form to the window again
    Then the list of available checks should not contain the form already assigned to the window


