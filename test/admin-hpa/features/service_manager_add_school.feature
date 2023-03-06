Feature:
  Add School


  Scenario: All fields are mandatory
    Given I am on the add school page
    When I submit an empty form
    Then I should see errors stating that the fields are mandatory

  Scenario: School can be added
    Given I am on the add school page
    When I submit valid values for a new school
    Then the new school should be added

  Scenario: Schools have to have a unique dfe number
    Given I am on the add school page
    When I submit a duplicate value for dfe number
    Then I should see an error stating the value for dfe number is a duplicate

  Scenario: Schools have to have a unique urn number
    Given I am on the add school page
    When I submit a duplicate value for urn number
    Then I should see an error stating the value for urn number is a duplicate

  Scenario: Dfe number must include a valid LEA code
    Given I am on the add school page
    When I enter details of a school which has a invalid LEA code
    Then I should see an error stating the LA code is incorrect

  Scenario: Dfe number must be 7 digits
    Given I am on the add school page
    When I enter a Dfe number that is 8 digits exactly
    Then I should see an error stating dfe number must be 7 digits

  Scenario: Dfe number must be 7 digits
    Given I am on the add school page
    When I enter a Dfe number that is 6 digits exactly
    Then I should see an error stating dfe number must be 7 digits

  Scenario: Test schools can be added
    Given I have added a test school
    Then the new school should be added as a test school
