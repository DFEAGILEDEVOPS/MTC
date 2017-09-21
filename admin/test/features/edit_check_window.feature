Feature: Edit Check Window

  Background:
    Given I want to edit a previously added check

  Scenario: Edit check window displays pre populated data
    Then I would see the edit check fields prepopulated with the data

  Scenario: Check Window detail is updated when valid details are entered
    When I update the check window with valid data
    Then I should be taken to the Manage Check Window page
    And I should see a flash message to state the check window has been updated
    And the updated Check Window Detail is Saved

  Scenario: User can Navigate back to Manage Check Window page
    When I decide to go back
    Then I should be taken to the Manage Check Window page
    And I should see no flash message to update check window is displayed