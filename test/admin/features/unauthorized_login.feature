@unauthorized_login
Feature:
  Unauthorized login

  Scenario: Access unauthorized page offers link to return to the school landing page
    Given I am on the unauthorized access page as a teacher
    When I decide to return to the homepage
    Then I should be taken to the school landing page

  Scenario: Access unauthorized page offers link to return to the service manager homepage
    Given I am on the unauthorized access page as a service manager
    When I decide to return to the homepage
    Then I should be taken to the service manager homepage

  Scenario: Access unauthorized page offers link to return to the test dev homepage
    Given I am on the unauthorized access page as a test developer
    When I decide to return to the homepage
    Then I should be taken to the Test Developer homepage

