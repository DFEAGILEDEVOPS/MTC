@feature-toggle
Feature:
  Create check window

  Scenario: Users can cancel the creation of a check window
    Given I navigate to the create check window page
    When I fill in details of a valid check window
    But decide I against creating it
    Then I should not see the window in the list

  Scenario: Name of check window cannot be less 2 characters
    Given I navigate to the create check window page
    When I try to submit a check name that is less than 1 character long
    Then I should see an error stating the check name cannot be less than 1 character long

  Scenario: Dates entered must be in the future
    Given I navigate to the create check window page
    When I enter dates that are in the past
    Then I should see error messages stating the dates must be in the future

  Scenario: Dates entered must not collide with actice check window
    Given I navigate to the create check window page
    When I enter dates that are inside of active check window
    Then I should errors for dates inside active check window date

  Scenario: All End dates can be same as the start dates
    Given I navigate to the create check window page
    When I enter end dates that are on the same day as the start date
    Then I should see it added to the list of check windows

  Scenario: Admin start date must be same or before the start date for familiarisation and live check
    Given I navigate to the create check window page
    When I enter a admin start date that is after the start dates for familiarisation and live check
    Then I should see an error stating the admin start date must be before the start dates for familiarisation and live check

  Scenario: Admin end date must be same or after the end dates for familiarisation and live check
    Given I navigate to the create check window page
    When I enter a admin end date that is before the end dates for familiarisation and live check
    Then I should see an error stating the admin end date must be after the end dates for familiarisation and live check

  Scenario: familiarisation Start date must be on the same day as the admin start date or in the future
    Given I navigate to the create check window page
    When I enter a familiarisation start date that is in the past compared to the admin start date
    Then I should see an error stating Start date for familiarisation must be on the same day or in the future as the admin start date

  Scenario: Familiarisation start date must be same as the live check start date
    Given I navigate to the create check window page
    When I enter a familiarisation start date that is a day after the live check start date
    Then I should see an error stating familiarisation start date must be at least a day before the live check start date

  Scenario: Familirisation end date must occur after admin start date
    Given I navigate to the create check window page
    When I enter a familirisation end date that is before the admin start date
    Then I should see an error stating familirisation end date must occur after admin start date

  Scenario: Live start date must be same as the familiarisation check start date
    Given I navigate to the create check window page
    When I enter a live start date that is a day before the familiarisation start date
    Then I should see an error stating live start date must be at least a day after the familiarisation check start date

  Scenario: Live end date must occur after admin start date
    Given I navigate to the create check window page
    When I enter a live end date that is before the admin start date
    Then I should see an error stating live end date must occur after admin start date

  Scenario: All fields are mandatory
    Given I navigate to the create check window page
    When I try submit with no dates
    Then I should errors stating that entries are required

  Scenario: All days within the dates must be no more than 2 digits
    Given I navigate to the create check window page
    When I enter all the days for each of the dates with more than 2 digits
    Then I should see an error stating I should enter only 2 digits

  Scenario: All days within the dates must be a valid day in a month
    Given I navigate to the create check window page
    When I enter all the days for each of the dates with an invalid day in a month
    Then I should see an error stating I should enter a valid day

  Scenario: All months within the dates must be no more than 2 digits
    Given I navigate to the create check window page
    When I enter all the months for each of the dates with more than 2 digits
    Then I should see an error stating I should enter only 2 digits for the month

  Scenario: All months within the dates must be a valid month in a year
    Given I navigate to the create check window page
    When I enter all the months for each of the dates with an invalid month in a year
    Then I should see an error stating I should enter a valid month

  Scenario: All years within the dates must be no more than 4 digits
    Given I navigate to the create check window page
    When I enter all the years for each of the dates with more than 4 digits
    Then I should see an error stating I should enter only 4 digits for the year

  Scenario: All months within the dates must be a valid month in a year
    Given I navigate to the create check window page
    When I enter all the years for each of the dates with an invalid year
    Then I should see an error stating I should enter a valid year

  Scenario: Users can create a check window
    Given I navigate to the create check window page
    When I submit details of a valid check window
    Then I should see it added to the list of check windows
    And stored correctly in the db

  Scenario: Users can delete a check window
    Given I previously created a check window
    When I decide to remove it
    Then it should be removed from the list of windows

  Scenario: Removal of check window can be cancelled
    Given I previously created a check window
    When I consider removing it
    But then change my mind
    Then it should be still in the list of windows
