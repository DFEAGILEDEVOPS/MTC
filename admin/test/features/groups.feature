Feature:
  Pupil groups

  Scenario: Groups page has a heading
    Given I am on the groups page
    Then I should see a heading on the groups page

  Scenario: Groups page has a intro
    Given I am on the groups page
    Then I should see a intro

  Scenario: Groups page has a option to create a new group
    Given I am on the groups page
    Then I should see a option to create a new group

  Scenario: Groups page has a table of existing groups
    Given I am on the groups page
    Then I should see a table of existing groups

  Scenario: Groups page has related content
    Given I am on the groups page
    Then I should see related content
