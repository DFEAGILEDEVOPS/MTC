@familiarisation_check_feature
Feature: Familiarisation Check

  Scenario: Familiarisation header is displayed when pupil logs in using familisarisation pin
    Given I am logged with familiarisation pin
    Then I can see familiarisation header section

  Scenario: Familiarisation header is displayed on instruction page
    Given I am on the instructions page for familiarisation check
    Then I can see familiarisation header section

  Scenario: Familiarisation header is displayed on warm up instruction page
    Given I am on the warm up intro page for familiarisation check
    Then I can see familiarisation header section

  Scenario: Pupil can start again after completing its familiarsation check
    Given I am on the familiarisation complete page
    And I click start again link
    Then I am on the what to expect page
