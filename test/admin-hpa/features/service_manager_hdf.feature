Feature: Service manager HDF

  Scenario: Service manager has no actions when the hdf has not been signed
    Given I am on the manage hdf submission page of a school that has not signed the hdf
    Then there is no actions for the service manager

  @hdf
  Scenario: Service manager can delete the hdf submission when the hdf has been signed
    Given I am on the manage hdf submission page of a school that has signed the hdf
    When the service manager deletes the hdf submission
    Then the hdf submission for that school is deleted

    @hdf
  Scenario: Service manager can undo the deletion of the hdf submission
    Given I am on the manage hdf submission page of a school that previously had the hdf submission deleted
    When the service manager undoes the delete of the hdf submission
    Then the hdf submission for that school is returned to the submitted state



