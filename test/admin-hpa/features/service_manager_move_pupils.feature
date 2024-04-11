@service_manager_move_pupil_feature
Feature:
  Service manager move pupil

  Scenario: Service manager can move a pupil to a different existing school
    Given I am on the pupil summary page for a pupil to be moved
    When I move the pupil to a different school
    Then the pupil should be moved to the target school

  Scenario: Service manager can cancel moving a pupil
    Given I am on the pupil summary page for a pupil to be moved
    When I cancel moving a pupil to a different school
    Then the pupil should not be moved

  Scenario: Target school has to be entered
    Given I am on the pupil summary page for a pupil to be moved
    When I attempt to move a pupil without entering a target school
    Then I should see an error stating target school is required

  Scenario: Target school has to be different to the current school
    Given I am on the pupil summary page for a pupil to be moved
    When I attempt to move a pupil without entering a different target school
    Then I should see an error stating target school has to be a different school

  Scenario: Target school has to be a school that exists
    Given I am on the pupil summary page for a pupil to be moved
    When I attempt to move a pupil entering a school that does not exist
    Then I should see an error stating target school does not exist

  Scenario: Target school has to be a valid URN
    Given I am on the pupil summary page for a pupil to be moved
    When I attempt to move a pupil using a upn that contains a letter
    Then I should see an error stating the urn is invalid
