@pupil_audit
Feature:
  Pupil Audit

  Scenario: Audit entry for adding a pupil
    Given I am logged in
    When I have added a pupil
    Then I should see an audit entry for adding a pupil

  Scenario: Audit entry for editing a pupil
    Given I have edited a pupil
    Then I should see an audit entry for editing a pupil

  Scenario: Audit entries for adding multiple pupils
    Given I have added multiple pupils
    Then I should see audit entries for multiple pupils

  Scenario: Audit entries for adding pupils to a group
    Given I have created a group with 5 pupils
    Then I should see audit entries for the group entries

  Scenario: Audit entries for editing pupils to a group
    Given I add pupils to a group
    Then I should see audit entries for the group changes

  Scenario: Audit entries for removing a group
    Given I have removed a group
    Then I should see audit entries for the removal of the group

  Scenario: Audit entries for freezing a pupil
    Given the service manager has set a pupil to be frozen
    Then I should see a audit entry for the frozen pupil

  Scenario Outline: Audit entry for pupil not taking the check
    Given I have a pupil not taking a check for <reason>
    Then I should see a audit entry for the pupil not taking the check for <reason>


    Examples:
      | reason                                         |
      | Incorrect registration                         |
      | Left school                                    |
      | Unable to access                               |
      | Working below expectation                      |
      | Just arrived and unable to establish abilities |

  Scenario: Audit entry for a pupil who has completed the check
    Given I have completed the check
    Then I should see a audit entry for the completed check

  Scenario: Audit entry for a restart
    Given I have a pupil who has a restart
    Then I should see a audit entry for the pupil with a restart

  Scenario: Audit entry for a discretionary restart
    Given I have a pupil with a discretionary restart
    Then I should see a audit entry for the pupil with a discretionary restart
