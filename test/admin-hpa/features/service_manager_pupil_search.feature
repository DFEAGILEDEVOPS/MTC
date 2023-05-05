Feature:
  Service manager pupil search

  Scenario: Service manager can search for a pupil via upn
    Given I am on the pupil search page
    When I search for a pupil using their upn
    Then the summary page is displayed with the status set to Not started along with details of the pupil

  Scenario: Message is displayed when no pupils are found matching the upn
    Given I am on the pupil search page
    When I attempt to search using a upn that does not match
    Then I should see a message stating no results were found

  Scenario: Pupil results page is displayed when more than one pupil is found
    Given I have 2 pupils with the same upns but at different schools
    When I am on the pupil search page
    And I search for a pupil using a upn that matches more than one pupil
    Then I should see the pupil results page with a list of matched pupils

  Scenario: Pupil summary page is displayed when pupil is selected from pupil results page
    Given I have searched for 2 pupils with the same upn
    When I click on one of the pupils in the list
    Then the summary page is displayed with the status set to Not started along with details of the pupil

  Scenario: Status is set to complete when pupil has completed a check
    Given a pupil has completed a check
    When I am on the pupil search page
    And I search for a pupil using the upn
    Then the summary page is displayed with the status set to Complete along with details of the pupil

  Scenario: Status is set to logged in when pupil logs in to a live check
    Given a pupil has logged into a check
    When I am on the pupil search page
    And I search for a pupil using the upn
    Then the summary page is displayed with the status set to Logged in along with details of the pupil

  Scenario: Status is set to restart when pupil logs in to a live check
    Given a pupil has a unconsumed restart
    When I am on the pupil search page
    And I search for a pupil using the upn
    Then the summary page is displayed with the status set to Restart along with details of the pupil

  Scenario: Status is set to pin generated when pupil logs in to a live check
    Given a pupil has a pin generated
    When I am on the pupil search page
    And I search for a pupil using the upn
    Then the summary page is displayed with the status set to PIN generated along with details of the pupil

  Scenario: Status is set to error in processing when there is a error with the live check
    Given there is a pupil with a processing error with a check
    When I am on the pupil search page
    And I search for a pupil using the upn
    Then the summary page is displayed with the status set to Error in processing along with details of the pupil


  Scenario Outline: Attendance is set when a pupil is set to not taking a check
    Given a pupil is not taking a check with the reason <reason>
    When I am on the pupil search page
    And I search for a pupil using the upn
    Then the summary page is displayed with the attendance status set to <reason> along with details of the pupil

    Examples:
      | reason                                         |
      | Incorrect registration                         |
      | Left school                                    |
      | Working below expectation                      |
      | Unable to access                               |
      | Just arrived and unable to establish abilities |
