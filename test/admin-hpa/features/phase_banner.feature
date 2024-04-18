@phase_banner_feature @serial
Feature:
  As a member of the development team
  I want users to be aware which phase the application is in and also offer feedback
  So they understand that the application is work in progess

  Scenario: Development phase and the feedback link are displayed at the top of the sign in page
    Given I am on the sign in page
    Then I should see that we are in the beta development phase on the sign_in page

  Scenario: Development phase and the feedback link are displayed at the top of the sign in failure page
    Given I am on the sign in failure page
    Then I should see that we are in the beta development phase on the sign_in_failure page

  Scenario: Development phase and the feedback link are displayed at the top of the school landing page
    Given I am on the school landing page
    Then I should see that we are in the beta development phase on the school_landing page

  Scenario: Development phase and the feedback link are displayed at the top of the Pupil Register page
    Given I am logged in
    When I am on the Pupil Register page
    Then I should see that we are in the beta development phase on the pupil_register page

  Scenario: Development phase and the feedback link are displayed at the top of the add pupil page
    Given I am logged in
    When I am on the add pupil page
    Then I should see that we are in the beta development phase on the add_pupil page

  Scenario: Development phase and the feedback link are displayed at the top of the edit pupil page
    Given I want to edit a previously added pupil
    Then I should see that we are in the beta development phase on the edit_pupil page
#    And I should see a feedback link from the edit_pupil page

  Scenario: Development phase and the feedback link are displayed at the top of the Upload and view form page
    Given I am logged in
    When I am on the Upload and View forms page
    Then I should see that we are in the beta development phase on the upload_and_view_forms page


  Scenario: Development phase and the feedback link are displayed at the top of the view form page
    Given I have signed in with test-developer
    When I am on the Upload and View forms page v2
    And I have uploaded a valid live form
    And I choose to preview the check form questions
    Then I should see that we are in the beta development phase on the view_form page

