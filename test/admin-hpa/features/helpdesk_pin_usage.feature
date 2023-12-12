Feature:
  View Pin Usage

  Scenario: Helpdesk users can navigate to the pin usage page via the homepage
    Given I have signed in with helpdesk
    And I enter and submit a valid 2011001 for impersonation
    When I select the view pin usage link
    Then I should be take to the view pin usage page

  Scenario: Pupil register summary displays correct data
    Given I am on the school landing page for school 2011001
    Then the data displayed in the pupil register summary table for 2011001 should be correct

  Scenario: Live checks summary displays correct data
    Given I am on the school landing page for school 2011001
    Then the data displayed in the live check summary table for 2011001 should be correct

  Scenario: TIO checks summary displays correct data
    Given I am on the school landing page for school 2011001
    Then the data displayed in the tio check summary table for 2011001 should be correct

  Scenario: Live school passwords are masked for helpdesk users
    Given I am on the school landing page for a school
    When I generate a live pin for a pupil
    Then the school password should be masked
    But the pupil pin should be visible

  Scenario: TIO school passwords are masked for helpdesk users
    Given I am on the school landing page for a school
    When I generate a tio pin for a pupil
    Then the school password should be masked
    But the pupil pin should be visible

  Scenario: Live school passwords are unmasked for STA Admin users
    Given I am on the school landing page for a school using an account with the sta admin role
    When I generate a live pin for a pupil
    Then the school password should be unmasked
    And the pupil pin should be visible

  Scenario: TIO school passwords are unmasked for STA Admin users
    Given I am on the school landing page for a school using an account with the sta admin role
    When I generate a tio pin for a pupil
    Then the school password should be unmasked
    And the pupil pin should be visible


