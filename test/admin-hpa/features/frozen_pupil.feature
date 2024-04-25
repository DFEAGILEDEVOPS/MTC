@frozen_pupil_feature
Feature:
  Frozen pupil

  Scenario: Annulled pupils are set to read only in the register
    Given the service manager has set a pupil to be annulled
    When I view the pupil register page
    Then the annulled pupil should be read only

  Scenario: Annulled pupils can be removed from a group
    Given I have a group of pupils
    When the service manager has set a pupil from the group to be annulled
    Then the annulled pupil can be removed from the group

  Scenario: annulled pupils can be added to a group
    Given the service manager has set a pupil to be annulled
    Then the annulled pupil can be added to a group

  Scenario: annulled pupils cannot remove their attendance code of Results annulled
    Given the service manager has set a pupil to be annulled
    When I am on the pupil not taking check page
    Then I should see the annulled pupil is read only

  Scenario: annulled pupils are not listed in the attendance code list
    Given the service manager has set a pupil to be annulled
    When I am on the pupil reason page
    Then the annulled pupil is not in the list of available pupils

  Scenario: annulled pupils are not eligble for TIO pin generation
    Given the service manager has set a pupil to be annulled
    Then they are not eligible for a TIO pin

  Scenario: annulled pupils are not elible for Live pin generation
    Given the service manager has set a pupil to be annulled
    Then they are not eligible for a live pin

  Scenario: annulled pupils are listed on the pupil status page
    Given the service manager has set a pupil to be annulled
    When I navigate to the pupil status page
    Then I should see the annulled pupil

  Scenario: Annulling a pupil can be undone
    Given the service manager has set a pupil to be annulled
    Then the service manager should be able to undo the annulment

  Scenario: Removing an annulment enables pupils to have a restart
    Given a pupil has been annulled after completing a check
    When the annulment is removed
    Then the pupil should be eligible for a restart

  Scenario: Removing an annulment enables pupils to remove a restart
    Given a annulled pupil who had an unconsumed restart
    When the annulment is removed
    Then the pupil should be able to remove the restart

  Scenario: Removing an annulment on a pupil who had previously had NTC is returned to that state
    Given a pupil who had a reason for not taking the check and was then annulled
    When the annulment is removed
    Then the pupil is returned to not taking the check for the reason that was initially selected

  Scenario: Removing an annulment on a pupil who had previously completed a check is returned to that state
    Given a pupil completes a check and then is annulled
    When the annulment is removed
    Then the pupils previous state of complete should be reinstated

  Scenario: Removing an annulment on a pupil who had previously had a live pin generated is returned to that state
    Given a pupil has a live pin generated and then is annulled
    When the annulment is removed
    Then the pupils previous state of having a live pin generated is reinstated

  Scenario: Removing an annulment on a pupil who had previously had a tio pin generated is returned to that state
    Given a pupil has a tio pin generated and then is annulled
    When the annulment is removed
    Then the pupils previous state of having a tio pin generated is reinstated

  Scenario: Error is displayed when a teacher is about to set attendance code but the pupil is annulled before submission
    Given I am about to submit a pupil for not taking the check
    But the pupil is frozen before the submission takes place
    Then a error is displayed

  Scenario: Annulled pupils are not eligble to be assigned AA
    Given the service manager has set a pupil to be annulled
    When I search for the annulled pupil
    Then the search list should be empty

  Scenario: Error is displayed when a teacher is about to apply AA's to a pupil but the pupil is frozen before submission
    Given I am about to apply a AA to a pupil
    But the pupil is frozen before the AA submission takes place
    Then a error is displayed

  Scenario: Error is displayed when a teacher tries to edit AA's for a pupil that has been frozen
    Given a pupil has an existing AA
    When the pupil is frozen
    Then the AA cannot be edited

  Scenario: Frozen pupils are not elible for a restart
    Given a pupil completes a check
    But the pupil is frozen straight after completion
    Then the pupil is not eligble for a restart

  Scenario: Frozen pupils with a unconsumed restart cannot have it removed
    Given I applied a restart to a pupil
    When the pupil is frozen
    Then the restart cannot be removed

  Scenario: Pupils can be frozen and are set to read only
    Given the service manager has set a pupil to be frozen
    Then the pupil is set to read only

  Scenario: Pupils can be thawed after being frozen
    Given the service manager has set a pupil to be frozen
    When the pupil is thawed
    Then the pupil is no longer frozen

  Scenario: Pupils can be annulled after being frozen
    Given the service manager has set a pupil to be frozen
    When the pupil is then set to annulled
    Then the pupil is set to read only
    And the pupils results are annulled

  Scenario Outline: Pupil results can be annulled for specific reasons
    Given the service manager has set a pupil to be annulled because of <reason>
    Then the pupil is set to read only
    And the pupils results are annulled because of <reason>

    Examples:
      | reason                                         |
      | maladmin                                       |
      | pupil_cheating                                 |










