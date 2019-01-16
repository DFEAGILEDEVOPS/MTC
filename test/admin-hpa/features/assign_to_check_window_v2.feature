@assign_to_check_window
Feature:
  As a test developer
  I want to assign a window for a check form
  So that pupils can sit the check

  Background:
    Given I am logged in with a test developer

  Scenario: Assign check window landing page displays information
    And I am on the assign check window v2 page
    Then I should see assign check window v2 page as per design
