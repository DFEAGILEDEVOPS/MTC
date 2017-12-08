@create_check_window
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
    Then I should see an error stating the name cannot be less than 2 characters long

  Scenario: Name of check window cannot be less 2 characters
    Given I am on the create a check window page
    When I try to submit a name that is less than 2 characters long
    Then I should see an error stating the name cannot be less than 2 characters long

  Scenario: Name of check window can be 2 or more characters
    Given I am on the create a check window page
    When I try to submit a name that is 2 characters long
    Then I should not see an error message for the check name

  Scenario: Admin start date has to be in the future
    Given I am on the create a check window page
    When I try to submit admin start date that is in the past
    Then I should see an error stating the admin start date has to be in the future

  Scenario: Admin start date cannot be left empty
    Given I am on the create a check window page
    When I try to submit without a admin start date for the window
    Then I should see an error stating the admin start date cant be blank

  @manual
  Scenario: Admin start date entries have to be numerical
    Given I am on the create a check window page
    When I try to submit an admin start date that consists of letters
    Then I should see an error stating the admin start date has to be numerical

  Scenario: Admin date has to consist of a valid day month year
    Given I am on the create a check window page
    When I try to submit with a invalid admin start date for the window
    Then I should see errors for the admin start day month and year

  Scenario: Admin date can't have more digits for day month year than specified
    Given I am on the create a check window page
    When I try to submit a admin start date with more digits for day month year than specified
    Then I should see errors for the admin start day month and year being invalid

  Scenario: Admin start date cant be after the check start date
    Given I am on the create a check window page
    When I try to submit an admin start date that is after the check start date
    Then I should see an error stating the admin start date has to be before the check start date

  Scenario: Start date has to be in the future
    Given I am on the create a check window page
    When I try to submit a start date that is in the past
    Then I should see an error stating the start date must be in the future

  Scenario: Check window has to have a check start date
    Given I am on the create a check window page
    When I try to submit without a check start date for the window
    Then I should see a error message for the check start date field

  @manual
  Scenario: Check start date entries have to be numerical
    Given I am on the create a check window page
    When I try to submit an check start date that consists of letters
    Then I should see an error stating the check start date has to be numerical

  Scenario: Check window has to have a valid check start day
    Given I am on the create a check window page
    When I try to submit with a invalid check start date for the window
    Then I should see errors for the start day month and year

  Scenario: Check start date can't have more digits for day month year than specified
    Given I am on the create a check window page
    When I try to submit a check start date with more digits for day month year than specified
    Then I should see errors for the check start day month and year being invalid

  Scenario: Check start date cant be before the admin start date
    Given I am on the create a check window page
    When I try to submit an check start date that is before the admin start date
    Then I should see an error stating the admin start date has to be before the check start date

  Scenario: Check start date cannot be after check end date
    Given I am on the create a check window page
    When I try to submit an check start date that is after the check end date
    Then I should see an error stating the check start date has to be before the check end date

  Scenario: Check end date has to be in the future
    Given I am on the create a check window page
    When I try to submit check end date that is in the past
    Then I should see an error stating the check end date has to be in the future

  Scenario: Check window has to have a end date
    Given I am on the create a check window page
    When I try to submit without a check end date for the window
    Then I should see a error message for the end date field

  @manual
  Scenario: Check end date entries have to be numerical
    Given I am on the create a check window page
    When I try to submit an check end date that consists of letters
    Then I should see an error stating the check end date has to be numerical

  Scenario: Check window has to have a valid end date
    Given I am on the create a check window page
    When I try to submit with a invalid check end date for the window
    Then I should see errors for the end day month and year

  Scenario: Check end date can't have more digits for day month year than specified
    Given I am on the create a check window page
    When I try to submit a check end date with more digits for day month year than specified
    Then I should see errors for the check end day month and year being invalid

  Scenario: Check end date cant be before check start date
    Given I am on the create a check window page
    When I try to submit an check end date that is before the check start date
    Then I should see an error stating the check end date has to be after the check start date
