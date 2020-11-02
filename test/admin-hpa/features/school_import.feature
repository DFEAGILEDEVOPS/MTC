@delete_school_import @school_import
Feature:
  School import


  Scenario: Schools that are open can be imported
    Given I have imported a csv with schools
    Then they should be stored alongside the existing schools
    And closed schools should not be imported

  Scenario: Duplicate schools can not be added
    Given I have inserted a school successfully
    When I attempt to insert the school again
    Then it should get an error saying the school is a duplicate

  Scenario: School import CSV has to be in the correct format
    Given I attempt to import using a csv file that is in the incorrect format
    Then it should get an error saying the csv is incorrect
