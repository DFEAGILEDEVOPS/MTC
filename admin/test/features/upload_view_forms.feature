Feature: Upload and View Forms

  Background:
    Given I have signed in with test-developer
    And I am on the Upload and View forms page

  Scenario: Upload and view forms page has a title
    Then I should see a heading on Upload and View forms page

  Scenario: Upload and view forms page has a option to upload new form
    Then I should have the option to upload new form

  Scenario: Upload new forms page has a title
    And I am on the Upload new forms page
    Then I should see a heading on Upload new form page
    And I can see sub heading 'Download example' on Upload new form Page
    And I can see sub heading 'Upload file(s)' on Upload new form Page

  Scenario: Add Multiple Pupil Landing page displays info for adding multiple pupil
    And I am on the Upload new forms page
    Then I can see the Info message on Upload new form Page

  Scenario: Add Multiple Pupil Landing page have option to upload CSV file for adding multiple pupil
    And I am on the Upload new forms page
    Then I should have the option to choose a csv file for adding new forms



