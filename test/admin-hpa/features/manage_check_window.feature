@manage_check_window_feature @serial
Feature:
  Manage check windows

  Background:
    Given I am logged in with a service manager

  Scenario: Manage check window page is displayed as per the design
    Given I am on the manage check windows page
    Then manage check window page is displayed as the the design

  Scenario: Windows that are in the past do not have a remove button
    Given I am on the manage check windows page
    Then windows in the past cannot be removed

  @create_new_window_hook
  Scenario: Modal to remove check window is displayed as per the design
    Given I am viewing the modal
    Then modal is displayed as per the design

  @create_new_window_hook
  Scenario: Windows that have a remove button can be removed
    Given I am on the manage check windows page
    When I decide to remove a window
    Then it should be removed from the list of check windows
    And it should be removed from the database

  @create_new_window_hook
  Scenario: Removal of check window can be cancelled
    Given I am on the manage check windows page
    When I want to remove a window
    But decide to cancel
    Then the window should not be removed

  @manual
  Scenario: Users can sort via check window name a-z
    Given I am on the manage check windows page
    Then the check name should be sorted a-z by default

  @manual
  Scenario: Users can sort via check window name z-a
    Given I am on the manage check windows page
    When I choose to sort to z-a
    Then the check name should be sorted z-a by default

  Scenario: Manage check window hub page matches design
    Given I am on the updated manage check windows page
    Then the manage check window hub page should match design
