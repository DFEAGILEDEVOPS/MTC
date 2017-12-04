@travis1
Feature:
  As a test developer
  I want to ensure that the system displays
  the navigation path as breadcrumb

  @wip @fix-in-17402
  Scenario: Verify breadcrumb on manage check forms
    Given I am logged in
    And I am on the profile page
    When I choose to manage check forms
    Then I should see the breadcrumb as "Home > Manage check forms"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on add pupil page
    Given I am logged in
    And I am on the add pupil page
    Then I should see the breadcrumb as "Home > Pupil Register > Add single pupil"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  @wip
  Scenario: Verify breadcrumb on Manage pupil page
    Given I am logged in
    And I click Manage pupil link
    Then I should see the breadcrumb as "Home > Manage pupils"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on Pupil Register page
    Given I am logged in
    When I click Pupil Register link
    Then I should see the breadcrumb as "Home > Pupil register"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on edit pupil page
    Given I am logged in
    When I click Pupil Register link
    And I choose to edit the first pupil in the list
    Then I should see the breadcrumb as "Home > Edit pupil data"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on results page
    Given I am logged in
    And I click the Results link
    Then I should see the breadcrumb as "Home > Results"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb for check settings page
    Given I am logged in with a service manager
    When I am on the check settings page
    Then I should see the breadcrumb as "Home > Check settings"
    And I click the Home link on breadcrumb
    Then I should be taken to the admin page

  Scenario: Verify breadcrumb for manage check windows page
    Given I am logged in with a service manager
    When I am on the manage check windows page
    Then I should see the breadcrumb as "Home > Manage check windows"
    And I click the Home link on breadcrumb
    Then I should be taken to the admin page

  Scenario: Verify breadcrumb for pupil not taking check page
    Given I am logged in
    When I am on the pupils not taking check page
    Then I should see the breadcrumb as "Home > Pupils not taking the check"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on restarts page
    Given I am logged in
    And I navigate to Restarts page
    Then I should see the breadcrumb as "Home > Restarts"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page