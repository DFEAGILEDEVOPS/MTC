@feedback
Feature: Feedback page

  Scenario: Users can supply the method of entry on the feedback page
    Given I am on the complete page
    When I choose to give feedback
    Then I should be able to provide my method of entry

  Scenario: Users can give feedback on how difficult it was to enter answers
    Given I am on the complete page
    When I choose to give feedback
    Then I should be able to give feedback on how difficult it was to enter answers

  Scenario: Users can give feedback on ways to make the check better
    Given I am on the complete page
    When I choose to give feedback
    Then I should be able to give feedback on ways to make the check better

  Scenario: Users can submit their feedback
    Given I am on the complete page
    When I choose to give feedback
    And I have provided my feedback
    Then I should be able to submit my feedback
    And I should be shown the thanks page

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

  Scenario: Users can submit feedback if they have opted not to add ways to improve the check
    Given I am on the complete page
    When I choose to give feedback
    And I feedback on how difficult the check was
    And I feedback on the method of entry used
    Then I should see the submit button is not disabled

  Scenario: Users cannot submit feedback if they have not given feedback on how difficult the check was
  or method of entry
    Given I am on the complete page
    When I choose to give feedback
    And I feedback on the ways to improve
    Then I should see the submit button disabled

  Scenario: Feedback link on complete page directs user to feedback page
    Given I am on the complete page
    When I select the feedback link from the complete page
    Then I should be taken to the feedback page

  Scenario: Next pupil on feedback thanks page logs user out
    Given I am on the feedback thanks page
    When I select next pupil
    Then I should be logged out
    And I should be taken to the sign in page

  @non_parallel @local_storage_dependant
  Scenario: Feedback is saved
    Given I am on the feedback thanks page
    Then my feedback should be saved
