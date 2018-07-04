@instructions
Feature:
  As a pupil I want a page of instructions
  So I know what to do

  Scenario: Instructions page should have a heading
    Given I am on the instructions page
    Then I should see a heading
    Then I should see a bulleted list of instructions
    Then I should see a start button
    Then I should see the total number of questions in the check
    Then I should see the timings between questions

  Scenario: Pupil Name is removed from Local storage after successful login and when pupil navigate to instruction page
    Given I am on the instructions page
    Then pupil name is removed from local storage
