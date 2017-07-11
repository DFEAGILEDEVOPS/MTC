@wip
Feature:
  As part of test development
  I want to be able to add a pupil
  So that I that they can be assigned to a check

  Scenario: Pupil data is stored when valid details are entered
    Given I am on the add pupil page
    When I have submitted valid pupil details
    Then the pupil details should be stored