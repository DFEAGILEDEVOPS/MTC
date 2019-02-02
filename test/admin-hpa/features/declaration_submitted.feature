@declaration_submitted
Feature: Declaration form submitted

  Background:
    Given I have signed in with teacher3
    Given all pupils have an attendance reason Absent

  Scenario: Declaration submitted page displays as per the design
    Given I am on the declaration submitted page
    Then I can see the declaration submitted page as per the design

  Scenario: View declaration submitted form page displays as per the design when confirmed
    Given I am on the declaration submitted page
    And I have submitted the form with confirmation
    And I click on view declaration form
    Then I am redirected to the declaration submitted form page
    Then I can see the declaration submitted form page confirmed as per the design

  Scenario: View declaration submitted form page displays as per the design when not confirmed
    Given I am on the declaration submitted page
    And I have submitted the form without confirmation
    And I click on view declaration form
    Then I am redirected to the declaration submitted form page
    Then I can see the declaration submitted form page not confirmed as per the design
