Feature:
  Create check window

  Scenario: Users can name a check window
    Given I am on the create a check window page
    Then I should be able to name the window

  Scenario: Users can enter a admin start date
    Given I am on the create a check window page
    Then I should be able to enter a admin start date

  Scenario: Users can enter a check start date
    Given I am on the create a check window page
    Then I should be able to enter a check start date

  Scenario: Users can enter a check end date
    Given I am on the create a check window page
    Then I should be able to enter a check end date

  Scenario: Users can create a check window
    Given I am on the create a check window page
    When I submit details for a valid check window
    Then I should see it added to the list of windows
    And stored correctly in the database

   Scenario: Users can cancel the creation of a check window
     Given I am on the create a check window page
     When I enter details for a valid check window
     But decide against creating it
     Then I should not see it in the list of windows

   Scenario: Check window has to have a name
     Given I am on the create a check window page
     When I try to submit without a name for the window
     Then I should see a error message for the name field

   Scenario: Check window has to have a admin start date
     Given I am on the create a check window page
     When I try to submit without a admin start date for the window
     Then I should see a error message for the admin start date field

   Scenario: Check window has to have a valid admin start date
     Given I am on the create a check window page
     When I try to submit with a invalid admin start date for the window
     Then I should see errors for the admin start day month and year

  Scenario: Check window has to have a check start date
     Given I am on the create a check window page
     When I try to submit without a check start date for the window
     Then I should see a error message for the check start date field

   Scenario: Check window has to have a valid check start day
     Given I am on the create a check window page
     When I try to submit with a invalid check start date for the window
     Then I should see errors for the start day month and year

   Scenario: Check window has to have a end date
     Given I am on the create a check window page
     When I try to submit without a check end date for the window
     Then I should see a error message for the end date field

   Scenario: Check window has to have a valid end date
     Given I am on the create a check window page
     When I try to submit with a invalid check end date for the window
     Then I should see errors for the end day month and year
