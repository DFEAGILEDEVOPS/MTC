@helpdesk_view_pupil_history_feature
Feature:
  Helpdesk user can view pupils' check history

  Scenario: Pupils who have not generated any pins have no check history
    Given I am on the school landing page for a school using an account with the helpdesk role
    When I view a pupils history
    Then I should not see any check history
    But I should see the pupils history

  Scenario: Pupils history is updated when a pupil is not taking the check
    Given I have a pupil not taking the check
    When I view the pupils history using the helpdesk role
    Then I should see this reflected in the pupils attendance history

  Scenario: Pupils history is updated when a pupil has an available restart
    Given I submitted pupils for Restart
    When I view the pupils history using the helpdesk role
    Then I should see this reflected in the pupils restarts history

  Scenario: Discretionary restart can not be applied by a helpdesk user when 3 checks have been taken
    Given I have a pupil who has the max number of restarts
    When I view the pupils history using the helpdesk role
    And I should not have the ability to apply a discretionary restart

  Scenario: Discretionary restart can be removed
    Given I have a pupil who has a discretionary restart
    When I view the pupils history using the helpdesk role
    Then I should not have the ability to remove the discretionary restart

  Scenario Outline: Pin generation is displayed in the check history for a pupil
    Given a <type> pin has been generated for a pupil
    When I view the pupils history using the helpdesk role
    Then I should see the pin gen reflected in the check history

    Examples:
      | type       |
      | Official   |
      | Try it out |

  Scenario Outline: Pupil logged in is displayed in the check history for a pupil
    Given pupil has logged in to a <type> check
    When I view the pupils history using the helpdesk role
    Then I should see the pupil login reflected in the check history

    Examples:
      | type       |
      | Official   |
      | Try it out |


  Scenario Outline: Completed checks are displayed in the check history for a pupil
    Given a pupil has completed the <type> check
    When I view the pupils history using the helpdesk role
    Then I should see the completed check reflected in the check history

    Examples:
      | type       |
      | Official   |
      | Try it out |

  Scenario: Multiple checks are displayed in the check history
    Given I have a pupil who has taken 3 checks
    When I view the pupils history using the helpdesk role
    Then I should see a list of all checks with the latest being marked as active

  Scenario: Consumed discrentionary restarts are shown in the check history
    Given a pupil has consumed a discretionary restart
    When I view the pupils history using the helpdesk role
    Then I should see a list of all checks including the consumed discretionary restart in the helpdesk view
