Feature: Login page

  Scenario: Sign in page has a STA logo
    Given I am on the SPA sign in page
    Then I should see a STA logo

  Scenario: Sign in has a heading
    Given I am on the SPA sign in page
    Then I should see a sign in page heading

  Scenario: Sign in has intro text
    Given I am on the SPA sign in page
    Then I should see some sign in page intro text

  Scenario: Sign in page has a sign in button
    Given I am on the SPA sign in page
    Then I should see a sign in button

  Scenario: Users cannot login with just a school pin
    Given I am on the SPA sign in page
    When I attempt to login with just a school pin
    Then I should be taken to the sign in failure page

  Scenario: Users cannot login with just a pupil pin
    Given I am on the SPA sign in page
    When I attempt to login with just a pupil pin
    Then I should be taken to the sign in failure page

  Scenario: Users can login with valid credentials
    Given I am on the SPA sign in page
    When I have logged in
    Then I should be taken to the instructions page

  Scenario: Error is displayed when no details are entered
    Given I am on the SPA sign in page
    When I have not entered any sign in details
    Then I should be taken to the sign in failure page

  Scenario: Login failure page allows users to try again
    Given I am on the SPA login failure page
    When I want to try logging in again
    Then I should be taken to the sign in page

  Scenario: Login failure page has a heading
    Given I am on the SPA login failure page
    Then I should see a sign in page failure heading

  Scenario: Login page has some instructions
    Given I am on the SPA login failure page
    Then I should see some text instructing me on what to do next

  Scenario: Local storage is populated with the questions and pupil metadata upon login
    Given I am on the SPA sign in page
    When I have logged in
    Then local storage should be populated with questions and pupil metadata

  @wip
  Scenario: Local storage is cleared upon loading of the login page
    Given I am on the SPA sign in page
    When I have logged in
    Then local storage should be cleared

  Scenario: Local storage is cleared when I have logged in but I return to login page as details are not correct
    Given I am on the SPA sign in page
    When I have logged in
    But I have chosen that the details are not correct
    Then local storage should be cleared


  Scenario: Confirmation page is displayed to the pupil on login
    Given I am on the SPA sign in page
    When I am logged in with a real pupil and school pin
    Then I should be taken to the instructions page

