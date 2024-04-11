@service_manager_attendance_code_feature @attendance_code_hook
Feature: Service manager attendance codes

  Scenario Outline: Service manager enable and disable attendance codes
    Given I am logged in
    When I view all the attendance codes
    Then I should be able to disable the <reason> code
    And the <reason> code should no longer be available to teachers

    Examples:
      | reason                                         |
      | Absent during check window                     |
      | Incorrect registration                         |
      | Left school                                    |
      | Unable to access                               |
      | Working below expectation                      |
      | Just arrived and unable to establish abilities |


