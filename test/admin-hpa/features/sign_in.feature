@sign_in_feature
Feature:
  As part of test development
  I want to be asked to autenticate
  So I know unkown users cannot access the service

  Scenario: Login page has a heading
    Given I am on the sign in page
    Then the sign in page should match design

  Scenario: User is logged in when Valid credentials are added
    Given I have entered valid credentials
    When I sign in
    Then I should be taken to the school landing page

  Scenario: Invalid credentials allow user to be authenticated
    Given I have entered invalid credentials
    When I sign in
    Then I should be taken to the failed login page

  Scenario: Contact page can be accessed via the footer
    Given I am on the sign in page
    When I decide to get in contact
    Then I should be taken to the contact page for mtc

  Scenario Outline: School ID is recorded when a user logs in
    Given I have logged in with <role>
    Then school ID or null should be recorded depnding if the user is linked to a school or not

    Examples:
      | role            |
      | teacher1        |
      | test-developer  |
      | service-manager |
      | helpdesk        |
      | tech-support    |
      | sta-admin       |
