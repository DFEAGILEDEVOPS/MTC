@school_landing_feature
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

  Scenario Outline: Helpdesk can login as a teacher
    Given I have signed in with <helpdesk>
    When I enter and submit a valid <dfenumber> for impersonation
    Then I should see helpdesk's name
    And helpdesk tools should be displayed

    Examples:
      | helpdesk | dfenumber |
      | helpdesk | 2011001   |
      | helpdesk | 2011002   |
      | helpdesk | 2011003   |
      | helpdesk | 2011005   |

  Scenario Outline: Helpdesk can login as a teacher
    Given I have signed in with <helpdesk>
    When I enter and submit a valid <dfenumber> for impersonation
    Then I should see helpdesk's name
    And helpdesk tools should be displayed

    Examples:
      | helpdesk | dfenumber           |
      | helpdesk | 2a0c1v1bfb0n0m1m    |
      | helpdesk | 201-1001            |
      | helpdesk | 20-11001            |
      | helpdesk | 201-1001            |
      | helpdesk | 20110-01            |
      | helpdesk | 201100-1            |
      | helpdesk | 2/011001            |
      | helpdesk | 20/11001            |
      | helpdesk | 201/1001            |
      | helpdesk | 2011/001            |
      | helpdesk | 20110/01            |
      | helpdesk | 201100/1            |
      | helpdesk | 2011001/            |
      | helpdesk | 2a0c1v1bfb0n0m1m    |
      | helpdesk | 2!0@1£1$0%0^2&      |
      | helpdesk | 2*0(1)1-0+0}3]{     |
      | helpdesk | "[20'1;"1:0?0/5.,<" |


  Scenario: Removing Impersonation returns user to Helpdesk impersonation page
    Given I have impersonated a school with the helpdesk user
    When I want to remove the impersonation
    Then I am taken back to the helpdesk impersonation page

  Scenario: Signing out from Helpdesk impersonation page returns user to the MTC login page
    Given I am on the helpdesk impersonation page
    When I want to sign out as a helpdesk user
    Then I am taken back to the login page

  Scenario: An error is shown when an invalid Dfe number is entered
    Given I am on the helpdesk impersonation page
    When I enter 0000000 as the Dfe number
    Then I am shown an error stating the value does not match a school

  Scenario Outline: Helpdesk user can access all pages
    Given I have impersonated a school with the helpdesk user
    Then I should be able to navigate to the <page>

    Examples:
      | page                        |
      | pupil_register              |
      | group_pupils                |
      | pupils_not_taking_check     |
      | access_arrangements         |
      | generate_passwords_and_pins |
      | restarts                    |
      | hdf                         |


  Scenario Outline: Helpdesk user can only access pages related to the role
    Given I have impersonated a school with the helpdesk user
    When I attempt to navigate to <url>
    Then I should be shown the access unauthorized page
    And I can return to the school landing page

    Examples:
      | url                                       |
      | /check-window/manage-check-windows        |
      | /check-window/create-check-window         |
      | /service-manager/upload-pupil-census      |
      | /service-manager/check-settings           |
      | /service-manager/mod-settings             |
      | /test-developer/view-forms                |
      | /test-developer/upload-new-forms          |
      | /test-developer/view-pupil-payload        |
