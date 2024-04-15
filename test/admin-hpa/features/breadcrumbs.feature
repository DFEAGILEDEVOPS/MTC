@breadcrumbs_feature
Feature:
  As a test developer
  I want to ensure that the system displays
  the navigation path as breadcrumb

  Scenario: Verify breadcrumb on manage check forms
    Given I have signed in with test-developer
    And I am on the Upload and View forms page
    Then I should see the breadcrumb as "Home > Upload and view forms"
    And I click the Home link on breadcrumb
    Then I should be taken to the Test Developer homepage

  Scenario: Verify breadcrumb on add pupil page
    Given I am logged in
    And I am on the add pupil page
    Then I should see the breadcrumb as "Home > View, add or edit pupils on your school's register > Add pupil"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on Generate passwords and pins page for either tio or live checks
    Given I am logged in
    And I navigate to generate passwords and pins page
    Then I should see the breadcrumb as "Home > Generate and view school password and PINs for the try it out and official check"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on the overview page for live pins
    Given I am logged in
    And I navigate to the live check overview page
    Then I should see the breadcrumb as "Home > Generate school passwords and PINs for the official check"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on the overview page for tio pins
    Given I am logged in
    And I navigate to the tio check overview page
    Then I should see the breadcrumb as "Home > Generate passwords and PINs for the try it out check"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on Pupil Register page
    Given I am logged in
    When I click Pupil Register link
    Then I should see the breadcrumb as "Home > View, add or edit pupils on your school's register"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on edit pupil page
    Given I am logged in
    When I click Pupil Register link
    And I choose to edit the first pupil in the list
    Then I should see the breadcrumb as "Home > View, add or edit pupils on your school's register > Edit pupil data"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  @manual
  Scenario: Verify breadcrumb on results page
    Given I am logged in
    And I click the Results link
    Then I should see the breadcrumb as "Home > Results"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb for check settings page
    Given I am logged in with a service manager
    When I am on the check settings page
    Then I should see the breadcrumb as "Home > Settings on pupil check"
    And I click the Home link on breadcrumb
    Then I should be taken to the admin page

  Scenario: Verify breadcrumb for manage check windows page
    Given I am logged in with a service manager
    When I am on the manage check windows page
    Then I should see the breadcrumb as "Home > Manage check windows"
    And I click the Home link on breadcrumb
    Then I should be taken to the admin page

  Scenario: Verify breadcrumb for pupil not taking check page
    Given I am logged in
    When I am on the pupils not taking check page
    Then I should see the breadcrumb as "Home > Give a reason why a pupil is not taking the check"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb on restarts page
    Given I am logged in
    And I navigate to Restarts page
    Then I should see the breadcrumb as "Home > Select pupils to restart the check"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

  Scenario: Verify breadcrumb for upload pupil census page
    Given I am logged in with a service manager
    When I navigate to the upload pupil census page
    Then I should see the breadcrumb as "Home > Upload pupil census"
    And I click the Home link on breadcrumb
    Then I should be taken to the admin page

  Scenario: Verify breadcrumb for Cookies page when logged in
    Given I am logged in
    When I navigate to the cookies form page
    Then I should see the breadcrumb as "Home > Cookies on MTC"
    And I click the Home link on breadcrumb
    Then I should be taken to the school landing page

