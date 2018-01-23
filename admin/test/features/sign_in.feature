@sign_in @local
Feature:
  As part of test development
  I want to be asked to autenticate
  So I know unkown users cannot access the service

  Scenario: Login page has a heading
    Given I am on the sign in page
    Then I should see a page heading

  Scenario: Login page has instructions
    Given I am on the sign in page
    Then I should see instructions

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