@cookies_feature
Feature: Cookies

  @generate_live_pin_hook
  Scenario: Device cookie created when pupil has logged in
    Given I am on the sign in page
    Then I should see no device cookie
    But I have logged in
    Then I should see a device cookie has been created

  Scenario: Completion page matches design
    Given I am on the complete page
    When the data sync function has run
    Then the device cookie is stored
