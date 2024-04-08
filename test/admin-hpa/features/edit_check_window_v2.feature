@edit_check_window
Feature:
  Edit check window

  Scenario: Dates in the past cannot be amended but can be viewed
    Given I want to edit a check window that is in the past
    Then I should not be able to make any changes to any start dates

  Scenario: Dates in the future can be amended
    Given I want to view a check window that is currently active
    Then I should only be able to edit dates that are in the future

  Scenario: Name of check window cannot be less 2 characters
    Given I previously created a check window
    And I decide to edit it
    When I try to submit a check name that is less than 1 character long
    Then I should see an error stating the check name cannot be less than 1 character long

  Scenario: Dates entered must be in the future
    Given I previously created a check window
    And I decide to edit it
    When I enter dates that are in the past
    Then I should see error messages stating the dates must be in the future

  Scenario: All End dates must same or after all the start dates
    Given I previously created a check window
    And I decide to edit it
    When I enter end dates that are on the same day as the start date
    Then I should see it updated in the list of check windows

  Scenario: Admin start date must be before the start date for familiarisation and live check
    Given I previously created a check window
    And I decide to edit it
    When I enter a admin start date that is after the start dates for familiarisation and live check
    Then I should see an error stating the admin start date must be before the start dates for familiarisation and live check

  Scenario: Admin end date must be after the end dates for familiarisation and live check
    Given I previously created a check window
    And I decide to edit it
    When I enter a admin end date that is before the end dates for familiarisation and live check
    Then I should see an error stating the admin end date must be after the end dates for familiarisation and live check

  Scenario: familiarisation Start date must be on the same day as the admin start date or in the future
    Given I previously created a check window
    And I decide to edit it
    When I enter a familiarisation start date that is in the past compared to the admin start date
    Then I should see an error stating Start date for familiarisation must be on the same day or in the future as the admin start date


  Scenario: Familiarisation start date must be at least a day before the live check start date
    Given I previously created a check window
    And I decide to edit it
    When I enter a familiarisation start date that is a day after the live check start date
    Then I should see an error stating familiarisation start date must be at least a day before the live check start date

  Scenario: Familirisation end date must occur after admin start date
    Given I previously created a check window
    And I decide to edit it
    When I enter a familirisation end date that is before the admin start date
    Then I should see an error stating familirisation end date must occur after admin start date

  Scenario: Live start date must be at least a day after the familiarisation check start date
    Given I previously created a check window
    And I decide to edit it
    When I enter a live start date that is a day before the familiarisation start date
    Then I should see an error stating live start date must be at least a day after the familiarisation check start date

  Scenario: Live end date must occur after admin start date
    Given I previously created a check window
    And I decide to edit it
    When I enter a live end date that is before the admin start date
    Then I should see an error stating live end date must occur after admin start date

  Scenario: All fields are mandatory
    Given I previously created a check window
    And I decide to edit it
    When I try submit the form with no dates
    Then I should errors stating that entries are required

  Scenario: All days within the dates must be no more than 2 digits
    Given I previously created a check window
    And I decide to edit it
    When I enter all the days for each of the dates with more than 2 digits
    Then I should see an error stating I should enter only 2 digits

  Scenario: All days within the dates must be a valid day in a month
    Given I previously created a check window
    And I decide to edit it
    When I enter all the days for each of the dates with an invalid day in a month
    Then I should see an error stating I should enter a valid day

  Scenario: All months within the dates must be no more than 2 digits
    Given I previously created a check window
    And I decide to edit it
    When I enter all the months for each of the dates with more than 2 digits
    Then I should see an error stating I should enter only 2 digits for the month

  Scenario: All months within the dates must be a valid month in a year
    Given I previously created a check window
    And I decide to edit it
    When I enter all the months for each of the dates with an invalid month in a year
    Then I should see an error stating I should enter a valid month

  Scenario: All years within the dates must be no more than 4 digits
    Given I previously created a check window
    And I decide to edit it
    When I enter all the years for each of the dates with more than 4 digits
    Then I should see an error stating I should enter only 4 digits for the year

  Scenario: All months within the dates must be a valid month in a year
    Given I previously created a check window
    And I decide to edit it
    When I enter all the years for each of the dates with an invalid year
    Then I should see an error stating I should enter a valid year

  Scenario: Users can save changes made to a check window
    Given I previously created a check window
    And I decide to edit it
    When I submit a valid change
    Then I should see it updated in the list of check windows
    And stored correctly in the db

  Scenario: Users can cancel changes made to a check window
    Given I previously created a check window
    And I decide to edit it
    When I decide to cancel any changes
    Then I should see no changes made in the list of windows
    And stored as it was in the db

  @wip
  Scenario: Service managers can edit the end dates to be in the past
    Given I want to edit a check window that has already started
    And I decide to change all end dates to the past
    Then I should be asked to confirm these changes before submission
    And they should be stored and updated
