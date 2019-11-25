Feature: Pupil Api

  @admin_logout
  Scenario: 200 response code is given when valid credentials are provided
    Given I make a request with valid credentials
    Then I should get a 200
    And I should see a valid response
    And I should see the correct response headers

  Scenario: 401 response code is given when invalid credentials are provided
    Given I make a request with invalid credentials
    Then I should get a 401
    And I should see a unauthorised response

  @new_check_process
  Scenario: Redis expiry time is set to 30 mins after login
    Given I have generated a pin for a pupil
    When I make a request to login
    Then I should see the expiry time change to 30 minutes


