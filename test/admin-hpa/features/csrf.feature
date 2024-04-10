@csrf_token_feature
Feature: CSRF token

  Scenario: Add pupils form has hidden csrf field
    Given I am logged in
    When I am on the add pupil page
    Then I should see the add pupils form has a hidden csrf field

  Scenario: Add multiple pupils form has hidden csrf field
    Given I am logged in
    When I am on the add multiple pupil page
    Then I should see the add multiple pupils form has a hidden csrf field

  Scenario: Pupils not taking check form has hidden csrf field
    Given I am on the pupil reason page
    Then I should see the pupil reason form has a hidden csrf field

  Scenario: Groups form has hidden csrf field
    Given I am on the create group page
    Then I should see the create group form has a hidden csrf field

  @deactivate_all_test_check_window_hook
  Scenario: Generate pins form has hidden csrf field
    Given I am logged in
    When I am on the generate pupil live pins page
    Then I should see the generate pins form has a hidden csrf field

  Scenario: Restarts form has hidden csrf field
    Given I am logged in
    When I am on the Restarts Page
    Then I should see the restarts form has a hidden csrf field

  Scenario: Create check window form has hidden csrf field
    Given I am on the create a check window page
    Then I should see the create a check window form has a hidden csrf field

  Scenario: Pupil census form has hidden csrf field
    Given I am on the upload pupil census page
    Then I should see the pupil census form has a hidden csrf field

  Scenario: Settings form has hidden csrf field
    Given I am logged in with a service manager
    And I am on the admin page
    When I am on the check settings page
    Then I should see the check settings form has a hidden csrf field

  Scenario: Upload new form has hidden csrf field
    Given I have signed in with test-developer
    And I am on the Upload and View forms page
    When I am on the Upload new forms page
    Then I should see the upload new form has a hidden csrf field

  @create_new_window_hook
  Scenario: Assign check form has hidden csrf field
    Given I am logged in with a test developer
    When I am on the assign check window page
    And I want to assign a form
    Then I should see the assign check form has a hidden csrf field

