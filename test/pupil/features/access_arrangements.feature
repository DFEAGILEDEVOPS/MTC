@access_arrangement_setting
Feature: Access Arrangements

  Scenario: Setting page is displayed as per design
    Given I logged in with user with access arrangement 'Audible Time Alert,Remove on-screen number pad'
    Then I can see setting page as per design
    And I can see following access arrangement
      | access_arrangement_type |
      | Remove number pad       |
      | Time alert              |

  Scenario: Setting page is displayed as per design for Input Assistance access arrangement
    Given I logged in with user with access arrangement 'Input assistance'
    Then I can see setting page for input assistance as per design

  Scenario: Error message is dispalyed if input assistance first name or last name is not provided
    Given I logged in with user with access arrangement 'Input assistance'
    When I click Next button on setting page
    Then I can see following message for input assistance
    |error_message|
    |Enter a first name|
    |Enter a last name|


  Scenario: Setting page is displayed as per design for Colour contrast access arrangement
    Given I logged in with user with access arrangement 'Colour contrast'
    Then I should see the colour contrast page matches design

  Scenario: Welcome page is displayed when user wants to accept a colour contrast
    Given I logged in with user with access arrangement 'Colour contrast'
    Then I should be taken to the Welcome page once i have chosen a colour