@retro_input_assistant_feature
Feature:
  Retrospective input assistance

  Scenario: Input assistance can be added retrospectively
    Given I have completed the check
    When I add an input assistant after taking the check
    Then the input assistant should be stored

  Scenario: Retro input assistant can be removed
    Given I have added an input assistant retrospectively
    Then I should be able to remove the retro input assistant

  Scenario: Exclude pupils with active restart
    Given I submitted pupils for Restart
    When I am on the retro input page
    Then searching for the pupil with an active restart does not return any results

  Scenario: 2nd checks can have input assistant added retrospectively
    Given I submitted pupils for Restart
    And Pupil has taken a 2nd check
    When I am on the retro input page
    Then I should be able to add input assistant against the second check

  Scenario: 3rd checks can have input assistant added retrospectively
    Given I submitted pupils for Restart
    And Pupil has taken a 3rd check
    When I am on the retro input page
    Then I should be able to add input assistant against the third check

  @pupil_not_taking_check_hook @live_tio_expired_hook @hdf_hook @reset_hdf_submission_hook
  Scenario: Retro input assistance cant be added after the HDF is signed
    Given I have signed the hdf
    Then I should not be able to add retro input assistance to any pupils

  @pupil_not_taking_check_hook @live_tio_expired_hook @hdf_hook @reset_hdf_submission_hook
  Scenario: Retro input assistance can be added if the check window is closed
    Given the check window is now closed
    Then I should be able to add an input assistant retrospectively
    And the access arrangement pupil list should be read only

  Scenario: First name and last name fields are limited to 128 chars
    Given I have completed the check
    When I add an input assistant details which are over 128 chars for first name and last name
    Then I should see validation errors relating to the first name and last name fields

  Scenario: First name and last name fields are not allowed to include special chars
    Given I have completed the check
    When I add an input assistant details which include special chars for first name and last name
    Then I should see validation errors relating to special chars in the first name and last name fields

  Scenario: Retro input requires a first and last name, a reason, and a pupil name
    Given I am on the retro input assitance page
    When I submit the form with no values
    Then I should see some errors

