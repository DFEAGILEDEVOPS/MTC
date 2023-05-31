@feedback
Feature: Feedback page

  @travis
  Scenario: Users can submit their feedback
    Given I am on the complete page
    When I choose to give feedback
    And I submit my feedback
    Then my feedback should be saved

  Scenario: Users cannot submit feedback if they have not given feedback on how difficult the check was
    Given I am on the complete page
    When I choose to give feedback
    Then I should see the submit button disabled

  Scenario: Next pupil on feedback thanks page logs user out
    Given I am on the feedback thanks page
    When I select next pupil
    Then I should be logged out
    And I should be taken to the sign in page

  Scenario: Feedback page is not shown until check has completed
    Given I attempt to directly navigate to the /feedback
    Then I should be redirected to the sign in page

  Scenario: Feedback thanks page is not shown until check has completed
    Given I attempt to directly navigate to the /feedback-thanks
    Then I should be redirected to the sign in page
