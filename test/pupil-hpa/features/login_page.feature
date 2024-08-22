@login_feature
Feature: Login page

  Scenario: Sign in page has a STA logo
    Given I am on the sign in page
    Then I should see a STA logo
    Then I should see a sign in page heading
    Then I should see a sign in button
    Then the sign in button should be disabled

  Scenario: Users cannot login with just a school pin
    Given I am on the sign in page
    When I attempt to login with just a school pin
    Then the sign in button should be disabled

  Scenario: Users cannot login with just a pupil pin
    Given I am on the sign in page
    When I attempt to login with just a pupil pin
    Then the sign in button should be disabled

  @generate_live_pin_hook
  Scenario: Users can login with valid credentials
    Given I have logged in
    Then I should be taken to the confirmation page
    And I should see all the correct pupil details
    And pupil name is removed from local storage

  @generate_live_pin_hook
  Scenario: Users can login with a space in the password
    Given I have logged in with a space in the password
    Then I should be taken to the confirmation page
    And I should see all the correct pupil details
    And pupil name is removed from local storage

  Scenario: Login failure message is displayed on the sign in page
    Given I am on the sign in page
    When I want to try login with invalid credentials
    Then I should see a failed login message

  @generate_live_pin_hook
  Scenario: Local storage is cleared when I have logged in but I return to login page as details are not correct
    Given I have logged in
    But I have chosen that the details are not correct
    Then local storage should be cleared

  Scenario: Pupil cannot login from a different school
    Given I have attempted to enter a school I do not attend upon login
    Then I should see a failed login message

  Scenario: Question Reader is set to true when a pupil requiring it logs in
    Given I logged in with user with access arrangement 'Audio version'
    Then I should see question reader set to true in the local storage

  @generate_live_pin_hook
  Scenario: Question Reader is set to false when a pupil who doesn't require it logs in
    Given I am logged in with a user who does not need question reader
    Then I should see question reader set to false in the local storage

  @no_local_storage_hook
  Scenario: Local storage error is displayed when local storage is disabled
    Given I navigate to the sign in page with local storage disabled
    Then I should see the local storage error page

  @wip
  Scenario: Connection test occurs before loading of the sign in page
    Given I navigate to the pupil spa
    Then I should see a loading page
    And if successful should be taken to the sign in page

