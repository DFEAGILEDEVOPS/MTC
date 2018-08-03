@view_and_custom_print_live_pin
Feature: View and Custom Print Live Check Pin


  Scenario: View and custom print page for live check is displayed as per design
    Given I am on view and custom print for live check page
    Then view and custom print page is displayed as per design

  Scenario: Pupils can be selected by a checkbox on Generate Pin page
    Given I am on view and custom print for live check page
    Then I should be able to select them via a checkbox on Custom Print Live check page

  Scenario: Sticky banner is not displayed on Custom Print Live check page if no pupil are selected
    Given I am on view and custom print for live check page
    Then I should not see a sticky banner

  Scenario: Sticky banner is displayed on Custom Print Live check page when a pupil is selected
    Given I am on view and custom print for live check page
    When I select a Pupil on Custom Print Live check page
    Then I should see a sticky banner

  Scenario: Sticky banner is not displayed if I deselect all pupil on Custom Print Live check page
    Given I am on view and custom print for live check page
    When I deselect all pupils on Custom Print Live check page
    Then I should not see a sticky banner

  Scenario: Sticky banner displays pupil count on Custom Print Live check page
    Given I am on view and custom print for live check page
    When I select multiple pupils from Generate Pin Page
    Then the sticky banner should display the pupil count

  Scenario: Cancel returns user to Generate Pupil Pin Landing page if there are no pupil with pins
    Given I am on view and custom print for live check page
    And I select a Pupil on Custom Print Live check page
    When I choose to cancel
    Then I should be taken to Generate Pupil Pins Page