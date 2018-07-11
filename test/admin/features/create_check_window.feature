@create_check_window
Feature:
  Create check window

  Scenario: Create check window Page should display all fields as per design
    Given I am on the create a check window page
    Then create check window page should display all fields as per design

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

  Scenario: Validation for Admin Start Date
    Given I am on the create a check window page
    Then I should see error message for the following admin start date
      | condition                               |
      | admin start date in past                |
      | empty admin start date                  |
      | invalid admin start date                |
      | more digit for day month and year       |
      | admin start date after check start date |

  @manual
  Scenario: Admin start date entries have to be numerical
    Given I am on the create a check window page
    When I try to submit an admin start date that consists of letters
    Then I should see an error stating the admin start date has to be numerical

  Scenario: Validation for Check Start Date
    Given I am on the create a check window page
    Then I should see error message for the following check start date
      | condition                             |
      | check start date in past              |
      | empty check start date                |
      | invalid check start date              |
      | more digit for day month and year     |
      | check start date after check end date |

  @manual
  Scenario: Check start date entries have to be numerical
    Given I am on the create a check window page
    When I try to submit an check start date that consists of letters
    Then I should see an error stating the check start date has to be numerical

  Scenario: Validation for Check End Date
    Given I am on the create a check window page
    Then I should see error message for the following check end date
      | condition                         |
      | check end date in past            |
      | empty check end date              |
      | invalid check end date            |
      | more digit for day month and year |


  @manual
  Scenario: Check end date entries have to be numerical
    Given I am on the create a check window page
    When I try to submit an check end date that consists of letters
    Then I should see an error stating the check end date has to be numerical

