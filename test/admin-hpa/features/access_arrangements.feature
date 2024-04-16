@access_arrangements_feature @add_a_pupil_hook
Feature: Access Arrangements

  Scenario: Access Arrangements page is displayed as per the design
    Given I am logged in
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

  Scenario: Pupil list is displayed with access arrangment on landing page
    Given I have selected access arrangement 'Audible time alert' for a pupil
    Then I can see the pupil in the access arrangment pupil list with access arrangment type 'Audible time alert'

  Scenario: Editting access arrangements page matches design
    Given I have added a pupil with an access arrangement
    When I select the pupil to edit the access arrangement
    Then the page should match design

  Scenario: Access arrangements for pupils can be edited
    Given I have added a pupil with an access arrangement
    When I select the pupil to edit the access arrangement
    Then I should be able to change the pupils access arrangements

  Scenario: Users can select all access arrangements
    Given I have a pupil who needs all possible access arrangements
    Then the arrangements should be listed against the pupil

  Scenario: Users can decide to cancel any changes to access arrangements
    Given I have added a pupil with an access arrangement
    When I select the pupil to edit the access arrangement
    And I add a new access arrangement
    But I decide to cancel any update
    Then I should see no changes made to the pupils access arrangements

  Scenario: Modal to remove Access arrangements is displayed as per design
    Given I have selected access arrangement 'Audible time alert' for a pupil
    When I want to remove all access arrangement for a pupil
    Then modal to remove access arrangements is displayed as per the design

  Scenario: Pupil is removed from the list when all access arrangement of that pupil is removed
    Given I have selected access arrangement 'Audible time alert' for a pupil
    When I removed all access arrangement for a pupil
    Then the pupil is removed from the access arrangmenet pupil list

  Scenario: Pupil is not removed from the list when teacher select No from the modal to remove access arrangements
    Given I have selected access arrangement 'Audible time alert' for a pupil
    When I decided to select no from the modal to remove access arrangment
    Then the pupil is not removed from the access arrangmenet pupil list

  Scenario: Removal of Access arrangements can be cancelled
    Given I have added a pupil with an access arrangement
    When I decide against removing access arrangements against a pupil
    Then there should be no change made to the pupils access arrangements

  Scenario: Access arrangements can be removed from the edit page
    Given I have added a pupil with an access arrangement
    Then I should be able to remove any access arrangements for the pupil from the edit page

  @deactivate_all_test_check_window_hook
  Scenario: Access arrangements can be updated after pin generation
    Given I have generated a live pin for a pupil
    And I have applied the Audible time alert access arrangement to the pupil
    When I decide to update the pupils access arrangements by adding Colour contrast
    Then these updates should be saved in the DB
