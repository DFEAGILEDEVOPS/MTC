@declaration_edit_reason @wip
Feature: Declaration edit attendance reason

  Background:
    Given I have signed in with teacher3
    Given all pupils have an attendance reason Absent

  Scenario: Edit reason page displays as per the design
    Given I am on the edit reason page
    Then I can see the edit reason page as per the design
