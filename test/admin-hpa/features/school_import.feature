@school_import_feature @school_import_hook @delete_school_import_hook
Feature:
  School import

  Scenario: Schools that are open can be imported
    Given I have imported a csv with schools
    Then they should be stored alongside the existing schools
    And closed schools should not be imported

  Scenario: Duplicate schools can not be added
    Given I have imported a csv with schools including duplicates
    Then I should see that unique schools are added
    And I should get an error saying there is a school that is a duplicate
    And the duplicate school should not be added

  Scenario: School import CSV has to be in the correct format
    Given I attempt to import using a csv file that is in the incorrect format
    Then I should get an error saying the csv is incorrect

  Scenario: Lea code can not be null
    Given I attempt to import using a csv file that has leaCode set to null
    Then I should get an error stating that leaCode can not be null

  Scenario: Estab code can not be null
    Given I attempt to import using a csv file that has estab code set to null
    Then I should get an error stating that estabCode can not be null

  Scenario: URN can not be null
    Given I attempt to import using a csv file that has URN set to null
    Then I should get an error stating that URN can not be null

  Scenario: School name can not be null
    Given I attempt to import using a csv file that has school name set to null
    Then I should get an error stating that school name can not be null

  Scenario: TOE code is persisted during school import
    Given I have imported a csv with schools
    Then I should see each imported school with a TOE code

  Scenario: New TOE codes are persisted during school import
    Given I have imported a csv with schools with a new TOE code
    Then I should see the new TOE code persisted
