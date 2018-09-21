@wip
Feature: ICT Survey Feedback

  Scenario: Feedback page matches design
    Given I am on the ICT survey feedback page
    Then the ICT survey feedback page should match design

  Scenario: Feedback text box has a limit of 1200 characters
    Given I am on the ICT survey feedback page
    Then I should only be to answer with 1200 characters

  Scenario: Users can provide their feedback
    Given I am on the ICT survey feedback page
    When I submit my ict survey feedback
    Then I should be taken to the feedback thanks page

  Scenario: Users must provide feedback for mandatory fields
    Given I am on the ICT survey feedback page
    When I attempt to only submit my contact details
    Then I should be shown an error

  Scenario: Users can opt out of the optional questions
    Given I am on the ICT survey feedback page
    When I attempt to submit only the feedback on problems faced
    Then I should be taken to the feedback thanks page