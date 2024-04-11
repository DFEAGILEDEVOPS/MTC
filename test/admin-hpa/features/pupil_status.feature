@pupil_status_feature @deactivate_all_test_check_window_hook
Feature: Pupil Status Outcome

  Scenario: Pupil status is Not Started when a new pupil is added
    Given I am logged in
    And I am on the add pupil page
    When I have submitted valid pupil details
    Then I can see the status for the pupil is 'Not started'

  @manual
  Scenario: Pupil status is Not Started when a pupil has started the check but not completed yet
    Given I have started the check
    Then I can see the status for the pupil is 'Not started'

  @manual
  Scenario: Pupil status is Not Started when PIN is expired
    Given I have generated a live pin for a pupil
    And I expired the pupil pin
    When I am on the Pupil Status page
    Then I can see the status for the pupil is 'Not started'

  Scenario: Pupil status is 'Signed in' when a pupil has Signed in
    Given I have logged in to the check
    When I am on the Pupil Status page
    Then I can see the status for the pupil is 'Signed in'

  @pupil_not_taking_check_hook
  Scenario Outline: Pupil Status is Not Taking the Check when a pupil is not taking the check
    Given I have a pupil not taking the check with the reason <reason>
    When I am on the Pupil Status page
    Then I can see the status for the pupil is <reason> for pupil not taking the check

    Examples:
      | reason                                         |
      | Incorrect registration                         |
      | Left school                                    |
      | Working below expectation                      |
      | Unable to access                               |
      | Just arrived and unable to establish abilities |

  Scenario: Counts displayed in the 4 status boxes should equal total pupils
    Given I am logged in
    When I am on the Pupil Status page
    Then the counts should equal the total number of pupils in the school

  Scenario: Pupil Status is Restart when a Restart is taken and PIN not yet Generated
    Given I submitted pupils for Restart
    When I am on the Pupil Status page
    Then I can see the status for the pupil is 'Restart applied'

  @incomplete_pupil_hook
  Scenario: Pupil status is 'Overdue - Signed in but check not started' when a pupil logs in but has not started the check
    Given there is a pupil with an incomplete status
    When I am on the Pupil Status page
    Then I can see the status for the pupil is 'Overdue - signed in but check not started'
    And I should see a red error box at the top of the page

  Scenario: Pupil status changes to Complete when pupil take 2nd check
    Given I submitted pupils for Restart
    And Pupil has taken a 2nd check
    When I am on the Pupil Status page
    Then I can see the status for the pupil is 'Complete'

  Scenario: Pupil status is shown as Processing error when there is a error in processing
    Given there is a processing error with a check
    When I am on the Pupil Status page
    Then I can see the status for the pupil is 'Error in processing'

  @processing_error_hdf_hook
  Scenario: Pupil with processing error can have a reason for NTC in order to sign HDF
    Given there is a processing error with a check
    And all other pupils are not taking the check
    And the HDF cannot be signed
    When the check period closes and the admin period is still active
    Then the pupil with the processing error can have a reason for not taking the check applied
    And then the HDF can be signed




