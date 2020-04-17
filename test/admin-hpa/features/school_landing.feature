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

  Scenario Outline: Helpdesk can login as a teacher
    Given I have signed in with <helpdesk>
    When I enter and submit a valid <dfenumber> for impersonation
    Then I should see helpdesk's name
    And helpdesk tools should be displayed

    Examples:
      | helpdesk | dfenumber |
      | helpdesk | 9991001   |
      | helpdesk | 9991002   |
      | helpdesk | 9991003   |
      | helpdesk | 9991004   |

  Scenario Outline: Helpdesk can login as a teacher
    Given I have signed in with <helpdesk>
    When I enter and submit a valid <dfenumber> for impersonation
    Then I should see helpdesk's name
    And helpdesk tools should be displayed

    Examples:
      | helpdesk | dfenumber           |
      | helpdesk | 9a9c9v1bfb0n0m1m    |
      | helpdesk | 9-991001            |
      | helpdesk | 99-91001            |
      | helpdesk | 999-1001            |
      | helpdesk | 99910-01            |
      | helpdesk | 999100-1            |
      | helpdesk | 9/991001            |
      | helpdesk | 99/91001            |
      | helpdesk | 999/1001            |
      | helpdesk | 9991/001            |
      | helpdesk | 99910/01            |
      | helpdesk | 999100/1            |
      | helpdesk | 9991001/            |
      | helpdesk | 9a9c9v1bfb0n0m1m    |
      | helpdesk | 9!9@9£1$0%0^2&      |
      | helpdesk | 9*9(9)1-0+0}3]{     |
      | helpdesk | "[99'9;"1:0?0/4.,<" |


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
      | page                               |
      | pupil_register                     |
      | group_pupils                       |
      | pupils_not_taking_check            |
      | access_arrangements                |
      | generate_pupil_pin_familiarisation |
      | generate_pupil_pin                 |
      | restarts                           |
      | hdf                                |


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
      | /check-form/view-forms                    |
      | /check-form/upload-new-forms              |
      | /test-developer/download-pupil-check-data |
      | /test-developer/view-pupil-payload        |

  @wip
  Scenario Outline: Service-manager school persona school is displayed
    Given I have signed in with <helpdesk>
    Then I should see the school name corresponding to that <dfenumber>
    Then I should see service-manager's name

    Examples:
      | helpdesk        | dfenumber |
      | service-manager | 9991001   |
      | service-manager | 9991002   |
      | service-manager | 9991003   |
      | service-manager | 9991004   |

  @incomplete_pupil @wip
  Scenario: Incomplete is displayed on the school homepage if there is one or more pupils with Incomplete status
    Given there is a pupil with an incomplete status
    When I navigate to the school landing page
    Then I should see a incomplete banner
