Feature:
  Tech support

  Scenario: Tech support users can login
    Given I have logged in with tech-support
    Then I should be taken to the tech support homepage

  Scenario: Check code has to be a valid UUID
    Given I am on the check view page
    When I enter a value that is not a valid UUID
    Then I should see an error stating the value is not valid

  Scenario: Check code is required
    Given I am on the check view page
    When I submit without entering a UUID
    Then I should see an error stating the UUID is required

  Scenario: Check summary is displayed when a checkcode is used taken from a completed check
    Given I have a checkCode from a completed check
    When I enter the checkCode from the completed check
    Then I should see the check summary
