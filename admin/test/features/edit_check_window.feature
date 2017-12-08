@edit_check_window
Feature: Edit Check Window

  Background:
    Given I want to edit a previously added check

  Scenario: Edit check window displays pre populated data
    Then I would see the edit check fields prepopulated with the data

  Scenario: Check Window detail is updated when valid details are entered
    When I update the check window with valid data
    Then I should be taken to the Manage Check Window page
    And I should see a flash message to state the check window has been updated
    And the updated Check Window Detail is Saved

  Scenario: User can Navigate back to Manage Check Window page
    When I decide to go back
    Then I should be taken to the Manage Check Window page
    And I should see no flash message to update check window is displayed

  Scenario: Users can cancel editing a check window
    But decide against editing it
    Then I should be taken to the Manage Check Window page

  Scenario: Check window has to have a name
    When I try to submit without a name for the window
    Then I should see an error stating the name cannot be less than 2 characters long

  Scenario: Name of check window cannot be less 2 characters
    When I try to submit a name that is less than 2 characters long
    Then I should see an error stating the name cannot be less than 2 characters long

  Scenario: Name of check window can be 2 or more characters
    When I try to submit a name that is 2 characters long
    Then I should not see an error message for the check name

  Scenario: Admin start date has to be in the future
    When I try to submit admin start date that is in the past
    Then I should see an error stating the admin start date has to be in the future

  Scenario: Admin start date cannot be left empty
    When I try to update without a admin start date for the window
    Then I should see an error stating the admin start date cant be blank

  @manual
  Scenario: Admin start date entries have to be numerical
    When I try to submit an admin start date that consists of letters
    Then I should see an error stating the admin start date has to be numerical

  Scenario: Admin date has to consist of a valid day month year
    When I try to submit with a invalid admin start date for the window
    Then I should see errors for the admin start day month and year

  Scenario: Admin date can't have more digits for day month year than specified
    When I try to submit a admin start date with more digits for day month year than specified
    Then I should see errors for the admin start day month and year being invalid

  Scenario: Admin start date cant be after the check start date
    When I try to submit an admin start date that is after the check start date
    Then I should see an error stating the admin start date has to be before the check start date

  Scenario: Start date has to be in the future
    When I try to submit a start date that is in the past
    Then I should see an error stating the start date must be in the future

  Scenario: Check window has to have a check start date
    When I try to update without a check start date for the window
    Then I should see a error message for the check start date field

  @manual
  Scenario: Check start date entries have to be numerical
    Given I am on the create a check window page
    When I try to submit an check start date that consists of letters
    Then I should see an error stating the check start date has to be numerical

  Scenario: Check window has to have a valid check start day
    When I try to submit with a invalid check start date for the window
    Then I should see errors for the start day month and year

  Scenario: Check start date can't have more digits for day month year than specified
    When I try to submit a check start date with more digits for day month year than specified
    Then I should see errors for the check start day month and year being invalid

  Scenario: Check start date cant be before the admin start date
    When I try to submit an check start date that is before the admin start date
    Then I should see an error stating the admin start date has to be before the check start date

  Scenario: Check start date cannot be after check end date
    When I try to submit an check start date that is after the check end date
    Then I should see an error stating the check start date has to be before the check end date

  Scenario: Check end date has to be in the future
    When I try to submit check end date that is in the past
    Then I should see an error stating the check end date has to be in the future

  Scenario: Check window has to have a end date
    When I try to submit without a check end date for the window
    Then I should see a error message for the end date field

  @manual
  Scenario: Check end date entries have to be numerical
    When I try to submit an check end date that consists of letters
    Then I should see an error stating the check end date has to be numerical

  Scenario: Check window has to have a valid end date
    When I try to submit with a invalid check end date for the window
    Then I should see errors for the end day month and year


  Scenario: Check end date can't have more digits for day month year than specified
    When I try to submit a check end date with more digits for day month year than specified
    Then I should see errors for the check end day month and year being invalid

  Scenario: Check end date cant be before check start date
    When I try to submit an check end date that is before the check start date
    Then I should see an error stating the check end date has to be after the check start date
