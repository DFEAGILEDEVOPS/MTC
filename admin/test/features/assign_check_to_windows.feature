Feature:
  As a test developer
  I want to assign a window for a check form
  So that pupils can sit the check

  Background:
    Given I am logged in

  Scenario: Assign check window page has a heading
    Given I am on the assign check window page
    Then I should see a heading for the page

  Scenario: Assign check window page has information about the check form
    Given I am on the assign check window page
    Then I should see some information about the check form

  Scenario: Assign check window page has page instructions
    Given I am on the assign check window page
    Then I should see some instructions

  Scenario: Assign check window page has option to continue
    Given I am on the assign check window page
    Then I should see an option to continue

  Scenario: Assign check window page has option to go back
    Given I am on the assign check window page
    Then I should see an option to go back

  Scenario: Assign check window page has check windows
    Given I am on the assign check window page
    Then I should see check windows

  Scenario: Check windows have a title
    Given I am on the assign check window page
    Then check windows should have a title

  Scenario: Check windows have a checkbox for selection
    Given I am on the assign check window page
    Then check windows should have a checkbox

  Scenario: Check windows have a start date
    Given I am on the assign check window page
    Then check windows should have a start date

  Scenario: Check windows have a end date
    Given I am on the assign check window page
    Then check windows should have a end date

  @wip
  Scenario: Users can attach a check form to a check window
    Given I have uploaded a check form
    When I have assigned the check form to a check window
    Then the check form should be displayed as being assigned to the check window

  @wip
  Scenario: Users can attach a check form to multiple check windows
    Given I previously assigned a check form to a check window
    When I have assigned the check form to another check window
    Then the check form should be displayed as being assigned to multiple check window