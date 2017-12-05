Feature: Restarts

  Scenario: Restarts Landing page displays heading and info section
    Given I have signed in with teacher2
    When I navigate to Restarts page
    Then I should see a heading for the Restarts page
    And I can see the info message for Restarts

  Scenario: Restarts page allows teachers to add a reason
    Given I am logged in
    And I navigate to Restarts page
    Then I should see a way to add a reason for restarts

  Scenario: Restarts page has a back to top button
    Given I am logged in
    And I am on the Restarts Page
    Then I should be able to go back to the top of restarts page

  Scenario: Restarts page has reasons
    Given I am logged in
    And I am on the Restarts Page
    Then I should see set of reasons I can choose for restarts

  Scenario: Restarts page has an explanation of the reasons
    Given I am logged in
    And I am on the Restarts Page
    Then I should see a section that explains the reasons for restarts

  Scenario: Pupils can be selected by a checkbox on Restarts page
    Given I have single pupils for restart
    Then I should be able to select them via a checkbox for restarts

  Scenario: Teachers can select all pupils on Restarts page
    Given I have multiple pupils for restart
    Then I should have a option to select all pupils for restarts

  Scenario: Sticky banner is not displayed on Restarts page if no reason or a pupil are selected
    Given I am logged in
    And I am on the Restarts Page
    Then I should not see a sticky banner on restarts page

  Scenario: Sticky banner is displayed on pupil Restarts page when a reason and a pupil are selected
    Given I have single pupils for restart
    And I select a reason for restarts
    When I select a pupil for restarts
    Then I should see a sticky banner

  Scenario: Sticky banner displays pupil count for restarts
    Given I have multiple pupils for restart
    When I select multiple pupils for restarts
    Then the sticky banner should display the pupil count

  Scenario: Confirmation is enabled if a reason and at least 1 pupil are selected for restarts
    Given I have single pupils for restart
    And I select a reason for restarts
    When I select a pupil for restarts
    Then I should see the confirm button enabled for restarts

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