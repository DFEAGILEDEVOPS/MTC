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

  Scenario: Validation for Admin Start Date
    Then I should see error message for the following admin start date
      | condition                               |
      | admin start date in past                |
      | update with empty admin start date      |
      | invalid admin start date                |
      | more digit for day month and year       |
      | admin start date after check start date |


  @manual
  Scenario: Admin start date entries have to be numerical
    When I try to submit an admin start date that consists of letters
    Then I should see an error stating the admin start date has to be numerical

  Scenario: Validation for Check Start Date
    Then I should see error message for the following check start date
      | condition                             |
      | check start date in past              |
      | update with empty check start date    |
      | invalid check start date              |
      | more digit for day month and year     |
      | check start date after check end date |

  @manual
  Scenario: Check start date entries have to be numerical
    Given I am on the create a check window page
    When I try to submit an check start date that consists of letters
    Then I should see an error stating the check start date has to be numerical

  Scenario: Validation for Check End Date
    Then I should see error message for the following check end date
      | condition                         |
      | check end date in past            |
      | empty check end date              |
      | invalid check end date            |
      | more digit for day month and year |

  @manual
  Scenario: Check end date entries have to be numerical
    When I try to submit an check end date that consists of letters
    Then I should see an error stating the check end date has to be numerical

