@manage_check_window
Feature:
  Manage check windows

  Background:
    Given I am logged in with a service manager

  Scenario: Manage check window page has a heading
    Given I am on the manage check windows page
    Then I should see page heading

  Scenario: Manage check window page has a instructions
    Given I am on the manage check windows page
    Then I should see page instructions

  Scenario: Manage check window page has the option to create a new window
    Given I am on the manage check windows page
    Then I should see a option to create a new window

  Scenario: Manage check window page has a panel with information about timings
    Given I am on the manage check windows page
    Then I should see a panel with information about timings

  Scenario: Manage check window page has a table with check windows
    Given I am on the manage check windows page
    Then I should see a table of check windows

  Scenario: Manage check window page has some guidance
    Given I am on the manage check windows page
    Then I should see a option to get some guidance

  Scenario: Manage check window page allows user to adjust timings of check
    Given I am on the manage check windows page
    Then I should see a option to adjust the timings of the check

  Scenario: Manage check window page has option to view progress report
    Given I am on the manage check windows page
    Then I should see a option to view the progress report

  Scenario: Windows that are in the past do not have a remove button
    Given I am on the manage check windows page
    Then windows in the past cannot be removed

  @create_new_window
  Scenario: Modal has a heading
    Given I am viewing the modal
    Then I should see the modal has a heading

  @create_new_window
  Scenario: Modal has content
    Given I am viewing the modal
    Then I should see the modal has some text

  @create_new_window
  Scenario: Modal has a option to cancel
    Given I am viewing the modal
    Then I should see an option to cancel

  @create_new_window
  Scenario: Modal has a option to confirm
    Given I am viewing the modal
    Then I should see an option to confirm

  @create_new_window
  Scenario: Windows that have a remove button can be removed
    Given I am on the manage check windows page
    When I decide to remove a window
    Then it should be removed from the list of check windows
    And it should be removed from the database

  @create_new_window
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
