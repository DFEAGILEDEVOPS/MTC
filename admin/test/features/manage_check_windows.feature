Feature:
  Manage check windows

  Background:
    Given I am logged in with a test developer

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