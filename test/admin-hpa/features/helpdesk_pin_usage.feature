Feature:
  View Pin Usage

  Scenario: Helpdesk users can navigate to the pin usage page via the homepage
    Given I have signed in with helpdesk
    And I enter and submit a valid 9991001 for impersonation
    When I select the view pin usage link
    Then I should be take to the view pin usage page


  Scenario: Pupil register summary displays correct data
    Given I am on the school landing page for school 9991001
    Then the data displayed in the pupil register summary table for 9991001 should be correct

  Scenario: Live checks summary displays correct data
    Given I am on the school landing page for school 9991001
    Then the data displayed in the live check summary table for 9991001 should be correct

  Scenario: TIO checks summary displays correct data
    Given I am on the school landing page for school 9991001
    Then the data displayed in the tio check summary table for 9991001 should be correct
