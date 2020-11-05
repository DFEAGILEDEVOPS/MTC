@restarts @reset_pin_restart_check @deactivate_all_test_check_window
Feature: Restarts

  Scenario: Restarts Landing page displays heading and info section
    Given I have signed in with teacher2
    When I navigate to Restarts page
    Then I should see the restarts page matches design

  Scenario: Pupils can be selected by a checkbox on Restarts page
    Given I have single pupils for restart
    Then I should be able to select them via a checkbox for restarts

  @ie11
  Scenario: Teachers can select all pupils on Restarts page
    Given I have multiple pupils for restart
    Then I should have a option to select all pupils for restarts

  @ie11
  Scenario: Sticky banner displays total pupil count for restarts when all pupil is selected
    Given I have multiple pupils for restart
    When I select all pupils for Restarts
    Then the sticky banner should display the total pupil count

  Scenario: Cancel returns user to pupil not taking check page
    Given I have single pupils for restart
    And I select a reason for restarts
    And I select a pupil for restarts
    When I choose to cancel
    Then I should be taken to the restarts page

  Scenario: Confirmation Message is displayed when Pupil is submitted successfully for Restarts
    Given I submitted pupils for Restart
    Then I should see a flash message to state the pupil has been submitted for restart

  Scenario: Error message is displayed if no info is provided for the reason Did Not Complete
    Given I have single pupils for restart
    When I submit the pupil for restart with a reason 'Did not complete' for restarts
    Then I should see the error message for further information for 'Did not complete' reason

  Scenario: Error message is displayed if no info is provided for the reason Classroom disruption
    Given I have single pupils for restart
    When I submit the pupil for restart with a reason 'Classroom disruption' for restarts
    Then I should see the error message for further information for 'Classroom disruption' reason

  Scenario: Pupil added to the restart list after Pupil is submitted using reason Classroom disruption
    Given I submitted pupils for Restart using reason Classroom disruption
    Then I should see pupil is added to the pupil restarts list with status 'Remove restart'
    And I should not see the pupil on the select pupils for restarts list

  Scenario: Pupil Restarts status changes to Restart Taken when pupil take 2nd check
    Given I submitted pupils for Restart
    And Pupil has taken a 2nd check
    Then I should see the Restart Status 'Restart taken' for the pupil

  Scenario: Pupil Restarts status changes to Remove Restart when pupil take 2nd Restart
    Given I submitted pupils for Restart
    When Pupil has taken a 2nd restart
    Then I should see the Restart Status 'Remove restart' for the pupil

  Scenario: Pupil Restarts status changes to Maximum Restart Taken when pupil take 3rd check
    Given I submitted pupils for Restart
    When Pupil has taken a 3rd check
    Then I should see the Restart Status 'Maximum number of restarts taken' for the pupil

  Scenario: Flash message is displayed when a pupil is removed from restart
    Given I submitted pupils for Restart
    When I remove restart for that pupil
    Then I should see a flash message to state the pupil has been removed from restart

  Scenario: Pupil doesnt appear in Generate Pin list if Restart is removed for that Pupil
    Given I submitted pupils for Restart
    When I remove restart for that pupil
    Then I should not see this pupil removed from restart in Generate Pin Pupil list

  Scenario: Pupils pin is removed if restart is removed
    Given I submitted pupils for Restart
    And I generate a pin for that pupil
    And I navigate to the restarts page
    When I remove restart for that pupil
    Then I should not see this pupil removed from restart in Generate Pin Pupil list
    And the pin should also be removed

  @no_pin @remove_all_groups @ie11
  Scenario: Group filtering enabled for selecting pupils for restart
    Given I have generated pins for multiple pupils
    When I add these pupils to a group
    And they become eligable for a restart
    Then I should be able to filter the pupil list by the group
    And I should be able to see the number of pupils in the group

  Scenario: Restarting more than 25 pupils is possible
    Given I have more than 25 pupils eligible for a restart
    Then I can select all
    And I should see the pupils have a restart

  @manual
  Scenario: Incomplete status is removed when a pupil has a restart applied
    Given there is a pupil with an incomplete status
    When I apply a restart to this pupil
    Then the pupil status should be restart
