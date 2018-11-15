@feedback
Feature: Feedback page

  Scenario: Users can submit their feedback
    Given I am on the complete page
    When I choose to give feedback
    And I submit my feedback
    Then my feedback should be saved

  Scenario: Users cannot submit feedback if they have not entered a method of entry
    Given I am on the complete page
    When I choose to give feedback
    And I feedback on how difficult the check was
    Then I should see the submit button disabled

  Scenario: Users cannot submit feedback if they have not given feedback on how difficult the check was
    Given I am on the complete page
    When I choose to give feedback
    And I feedback on the method of entry used
    Then I should see the submit button disabled

  Scenario: Users cannot submit feedback if they have not given feedback on how difficult the check was
  or method of entry
    Given I am on the complete page
    When I choose to give feedback
    And I feedback on the ways to improve
    Then I should see the submit button disabled

  Scenario: Next pupil on feedback thanks page logs user out
    Given I am on the feedback thanks page
    When I select next pupil
    Then I should be logged out
    And I should be taken to the sign in page

