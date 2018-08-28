@access_arrangements @wip @feature_toggle
Feature: Access Arrangements

  Scenario: Access Arrangements page is displayed as per the design
    Given I have signed in with teacher2
    And I navigate to access arrangements page
    Then the access arrangements page is displayed as per the design

  Scenario: Select access arrangements page matches design
    Given I am on the select access arrangements page
    Then I should see the select access arrangements page matches design

  Scenario: search suggestion is displayed after 2 charcheters of search term
    Given I am on the select access arrangements page
    When I search for pupil 'pu'
    Then I can see auto search list

  Scenario: Auto search returns the pupil when it is searched for
    Given I search for the pupil for access arrangement
    Then I can see the pupil returned in auto search list

  Scenario: Validation error is displayed if pupil name is not entered
    Given I am on the select access arrangements page
    When I save access arrangements without selecting pupil
    Then I can see the error message for access arrangmenets 'Enter a pupil name'

  Scenario: Validation error is displayed if no access arrangement is selcted
    Given I am on the select access arrangements page
    When I save access arrangements without selecting any access arrangements
    Then I can see the error message for access arrangmenets 'Select at least one access arrangement'

  Scenario: Validation error is displayed if no explanation is provided for input assistance
    Given I am on the select access arrangements page
    When I save access arrangements without providing explanation for input assistance
    Then I can see the error message for access arrangmenets 'Enter an explanation for input assistance'

  Scenario: Validation error is displayed if no question reader reason is selected
    Given I am on the select access arrangements page
    When I save access arrangements without selecting any question reader reason
    Then I can see the error message for access arrangmenets 'Select a reason'

  Scenario: Validation error is displayed if other is selected for question reader but no explanation is provided
    Given I am on the select access arrangements page
    When I save access arrangements without providing explanation for other reason for question reader
    Then I can see the error message for access arrangmenets 'Enter an explanation for question reader'

  Scenario: Pupil list is displayed with access arrangment on landing page
    Given I have selected access arrangement 'Audible time alert' for a pupil
    Then I can see the pupil in the access arrangment pupil list with access arrangment type 'Audible time alert'