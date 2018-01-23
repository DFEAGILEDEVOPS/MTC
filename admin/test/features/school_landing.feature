@school_landing @local
Feature:
  As a member of staff
  I want to have a central page as a starting point
  So that I can easily get to where I need to go

  Scenario Outline: Teachers school is displayed
    Given I have signed in with <teacher>
    Then I should see <teacher>'s school name

    Examples:
      | teacher  |
      | teacher1 |
      | teacher2 |
      | teacher3 |
      | teacher4 |

  Scenario Outline: Teachers' sees their name on the school homepage
    Given I have signed in with <teacher>
    Then I should see <teacher>'s name

    Examples:
      | teacher  |
      | teacher1 |
      | teacher2 |
      | teacher3 |
      | teacher4 |

  Scenario: School landing page displays instructions
    Given I am on the school landing page
    Then I should see some instructions on what to do next

  @wip
  Scenario: School landing page has option to manage pupils
    Given I am on the school landing page
    Then I should see an option to go to the manage pupils area

  @wip
  Scenario: School landing page has option to submit attendance register
    Given I am on the school landing page
    Then I should see an option to go to the submit the attendance register area

  Scenario: School landing page has option to view results of the check
    Given I am on the school landing page
    Then I should see an option to view the results

  Scenario: Users can logout
    Given I am on the school landing page
    When I decide to logout
    Then I am taken back to the login page

  Scenario: School landing page has a before you start section
    Given I am on the school landing page
    Then I should see the before you start section

  Scenario: Before you start section has option to view some guidance
    Given I am on the school landing page
    Then I should see option to view guidance in the before you start section
