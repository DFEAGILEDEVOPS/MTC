@instructions_feature
Feature:
  As a pupil I want a page of instructions
  So I know what to do

  Scenario: Instructions page should have a heading
    Given I am on the instructions page
    Then I should see the instructions page matches design

  Scenario: Pupil Name is removed from Local storage after successful login and when pupil navigate to instruction page
    Given I am on the instructions page
    Then pupil name is removed from local storage
