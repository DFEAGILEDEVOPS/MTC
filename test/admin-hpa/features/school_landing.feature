@school_landing
Feature:
  As a member of staff
  I want to have a central page as a starting point
  So that I can easily get to where I need to go

  Scenario Outline: Teachers name and school name is displayed
    Given I have signed in with <teacher>
    Then I should see <teacher>'s school name
    And I should see <teacher>'s name

    Examples:
      | teacher  |
      | teacher1 |
      | teacher2 |
      | teacher3 |
      | teacher4 |
    
  Scenario: School landing page matches design
    Given I am on the school landing page
    Then I should see the school landing page matches design

  Scenario: Users can logout
    Given I am on the school landing page
    When I decide to logout
    Then I am taken back to the login page

  Scenario Outline: Helpdesk school is displayed
    Given I have signed in with <helpdesk>
    Then I should see the school name corresponding to that <dfenumber>
    Then I should see helpdesk's name

    Examples:
      | helpdesk         | dfenumber |
      | helpdesk:9991001 | 9991001   |
      | helpdesk:9991002 | 9991002   |
      | helpdesk:9991003 | 9991003   |
      | helpdesk:9991004 | 9991004   |

  Scenario Outline: Service-manager school persona school is displayed
    Given I have signed in with <helpdesk>
    Then I should see the school name corresponding to that <dfenumber>
    Then I should see service-manager's name

    Examples:
      | helpdesk                | dfenumber |
      | service-manager:9991001 | 9991001   |
      | service-manager:9991002 | 9991002   |
      | service-manager:9991003 | 9991003   |
      | service-manager:9991004 | 9991004   |
    