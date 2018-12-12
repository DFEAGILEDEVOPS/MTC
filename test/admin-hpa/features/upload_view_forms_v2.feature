@upload_view_forms
Feature: Upload and View Forms

  Background:
    Given I have signed in with test-developer
    When I am on the Upload and View forms page v2

  Scenario: Upload and view forms page matches design
    Then I should see the page matches design

  Scenario: Upload new form page matches design
    When I select to upload a new form
    Then the upload form page matches design
