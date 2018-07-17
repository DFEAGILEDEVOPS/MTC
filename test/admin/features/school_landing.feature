@school_landing
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

  Scenario: School landing page has option to view pupil register
    Given I am on the school landing page
    Then I should see an option to view the pupil register

  Scenario: School landing page has option to group pupils
    Given I am on the school landing page
    Then I should see an option to group pupils

  Scenario: School landing page has option to select pupils not taking the check
    Given I am on the school landing page
    Then I should see an option to select pupils not taking the check

  Scenario: School landing page has option to select pupils not taking the check
    Given I am on the school landing page
    Then I should see an option to select pupils not taking the check

  Scenario: School landing page has option to manage access arrangements
    Given I am on the school landing page
    Then I should see an option to manage access arrangements

  Scenario: School landing page has option to generate pins
    Given I am on the school landing page
    Then I should see an option to generate pins

  Scenario: School landing page has option to generate pins familiarisation
    Given I am on the school landing page
    Then I should see an option to generate pins familiarisation

  Scenario: School landing page has option to manage restarts
    Given I am on the school landing page
    Then I should see an option to manage restarts

  Scenario: School landing page has option to complete the hdf
    Given I am on the school landing page
    Then I should see a disabled option for the hdf

  Scenario: School landing page has option to view results of the check
    Given I am on the school landing page
    Then I should see an option to view the results

  Scenario: Users can logout
    Given I am on the school landing page
    When I decide to logout
    Then I am taken back to the login page

  Scenario: School landing page has a before you start section
    Given I am on the school landing page
    Then I should see the related section

  Scenario: Before you start section has option to view some guidance
    Given I am on the school landing page
    Then I should see option to view guidance in the before you start section

  Scenario Outline: Helpdesk school is displayed
    Given I have signed in with <helpdesk>
    Then I should see the school name corresponding to that <dfenumber>

    Examples:
      | helpdesk         | dfenumber |
      | helpdesk:9991001 | 9991001   |
      | helpdesk:9991002 | 9991002   |
      | helpdesk:9991003 | 9991003   |
      | helpdesk:9991004 | 9991004   |

  Scenario Outline: Helpdesk sees their name on the school homepage
    Given I have signed in with <helpdesk>
    Then I should see helpdesk's name

    Examples:
      | helpdesk         |
      | helpdesk:9991001 |
      | helpdesk:9991002 |
      | helpdesk:9991003 |
      | helpdesk:9991004 |

  Scenario Outline: Service-manager school persona school is displayed
    Given I have signed in with <helpdesk>
    Then I should see the school name corresponding to that <dfenumber>
    
    Examples:
      | helpdesk                | dfenumber |
      | service-manager:9991001 | 9991001   |
      | service-manager:9991002 | 9991002   |
      | service-manager:9991003 | 9991003   |
      | service-manager:9991004 | 9991004   |

  Scenario Outline: Service-manager school persona sees their name on the school homepage
    Given I have signed in with <helpdesk>
    Then I should see service-manager's name

    Examples:
      | helpdesk                |
      | service-manager:9991001 |
      | service-manager:9991002 |
      | service-manager:9991003 |
      | service-manager:9991004 |
