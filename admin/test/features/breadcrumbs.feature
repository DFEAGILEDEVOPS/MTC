Feature:
  As a test developer
  I want to ensure that the system displays
  the navigation path as breadcrumb

  Background:
    Given I am logged in

  Scenario: Verify breadcrumb on manage check forms
    Given I am on the profile page
    When I choose to manage check forms
    Then I should see the breadcrumb as "Home > Manage check forms"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on add pupil page
    Given I am on the add pupil page
    Then I should see the breadcrumb as "Home > Add single pupil"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on Manage pupil page
    When I click Manage pupil link
    Then I should see the breadcrumb as "Home > Manage pupils"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on Pupil Register page
    When I click Pupil Register link
    Then I should see the breadcrumb as "Home > Pupil register"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on edit pupil page
    When I click Pupil Register link
    And I choose to edit the first pupil in the list
    Then I should see the breadcrumb as "Home > Edit pupil data"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on results page
    When I click the Results link
    Then I should see the breadcrumb as "Home > Results"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page
