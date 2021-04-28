Feature:
  Service manager edit school

  Scenario: Service manager can edit a school
    Given I have searched for a school
    When I change all the details of the school
    And I save these changes
    Then these changes are reflected in the DB

  Scenario: Service manager can discard any changes
    Given I have searched for a school
    When I change all the details of the school
    And I discard the changes
    Then these changes are not reflected in the DB
