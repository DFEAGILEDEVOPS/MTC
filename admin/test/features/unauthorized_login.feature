@unauthorized_login @login
Feature:
  Unauthorized login

  Scenario: School teachers can only access pages their roles apply to
    Given I have logged in with teacher1
    When I try to view the admin page
    Then I should be shown the access unauthorized page

  Scenario: Test Developers can only access pages their roles apply to
    Given I have logged in with test-developer
    When I try to view the school landing page
    Then I should be shown the access unauthorized page

  Scenario: Access unauthorized page offers link to return to the school landing page
    Given I am on the unauthorized access page as a teacher
    When I decide to return to the homepage
    Then I should be taken to the school landing page

  Scenario: Access unauthorized page offers link to return to the service manager homepage
    Given I am on the unauthorized access page as a service manager
    When I decide to return to the homepage
    Then I should be taken to the service manager homepage

