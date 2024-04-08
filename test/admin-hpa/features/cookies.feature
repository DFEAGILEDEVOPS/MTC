@cookies
Feature:
  Cookies policy


  Scenario: Cookies banner is shown when users visit the site for the first time
    Given I am on the sign in page for the first time
    Then I should see the cookie banner

  Scenario: Cookies banner is not displayed when i have already accepted all cookies
    Given I am logged in
    When I am on the Pupil Register page
    Then I should not see the cookie banner

  Scenario: Users can set their cookie prefs
    Given I am on the sign in page
    When I select the cookies link
    Then I should be taken to the cookies prefs page

  Scenario: Session Id cookie value changes upon logging out
    Given I am logged in
    And the session ID cookie is set
    When I decide to logout
    Then the value of the session ID should change
