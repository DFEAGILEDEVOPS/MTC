@live_check_window_closed
Feature: STA Admin use can add pupils

  Scenario: STA Admin can add a pupil when live check window is closed
    Given I am on the school landing page for a school using an account with the sta admin role
    And the live check window has closed
    Then I should be able to add a pupil

  Scenario: Teachers cannot add a pupil when live check window is closed
    Given I am logged in
    And the live check window has closed
    Then I should not be able to add a pupil
