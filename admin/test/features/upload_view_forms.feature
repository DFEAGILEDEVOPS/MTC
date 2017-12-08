@upload_view_forms
Feature: Upload and View Forms

  Background:
    Given I have signed in with test-developer
    And I am on the Upload and View forms page

  Scenario: Download usage report link is not displayed
    Then I should see no link to download an example usage report

  Scenario: Upload and view forms page has a title
    Then I should see a heading on Upload and View forms page

  Scenario: Upload and view forms page has a option to upload new form
    Then I should have the option to upload new form

  Scenario: Upload new forms page has a title
    And I am on the Upload new forms page
    Then I should see a heading on Upload new form page

  Scenario: Upload new forms page has a Sub title
    And I am on the Upload new forms page
    Then I can see sub heading 'Download example' on Upload new form Page
    And I can see sub heading 'Upload file(s)' on Upload new form Page

  Scenario: Upload check form page displays info for uploading a new check form
    And I am on the Upload new forms page
    Then I can see the Info message on Upload new form Page

  Scenario: Upload check form page have option to upload CSV file for uploading a new check form
    And I am on the Upload new forms page
    Then I should have the option to choose a csv file for adding new forms

  Scenario: Users can upload a csv file
    When I upload a csv file
    Then it should be added to the list of forms

  Scenario: Flash message is displayed after successful upload
    When I upload a csv file
    Then I should see a flash message to state that new form is uploaded

  Scenario: Check Forms that have a remove button can be removed
    When I decide to remove a check form
    Then it should be removed from the list of check form

  Scenario: Removal of Check Form can be cancelled
    When I want to remove a check form
    But decide to cancel
    Then the check form should not be removed

  Scenario: Sorting Check Forms by Name
    When I click on the check form title heading
    Then I should see on the check forms are displayed in descending order of form name

  Scenario: Users can remove a csv file that is ready to be uploaded
    Given I am ready to upload a csv file
    But I have removed it
    Then it should not be available to be uploaded

  Scenario: Users are shown the errors if they try to upload a csv containing minus characters
    Given I attempt to upload a csv containing minus characters
    Then I should see error messages stating why the csv has failed to upload

  Scenario: Users are shown the errors if they try to upload a csv containing letters
    Given I attempt to upload a csv containing letters
    Then I should see error messages stating why the csv has failed to upload

  Scenario: Users are shown the errors if they try to upload a csv containing a header row
    Given I attempt to upload a csv containing a header row
    Then I should see error messages stating why the csv has failed to upload

  Scenario: Users are shown the errors if they try to upload a csv containing more than 2 columns
    Given I attempt to upload a csv containing more than 2 columns
    Then I should see error messages stating why the csv has failed to upload

  Scenario: Users are shown the errors if they try to upload a csv containing numbers greater than 12
    Given I attempt to upload a csv containing numbers greater than 12
    Then I should see error messages stating why the csv has failed to upload

  Scenario: Users are shown the errors if they try to upload a file that is not a csv format
    Given I attempt to upload a file that is not a csv format
    Then I should see error messages stating why the csv has failed to upload

  Scenario: Users are shown the errors if they try to upload a csv containing decimal numbers
    Given I attempt to upload a csv containing decimal numbers
    Then I should see error messages stating why the csv has failed to upload

  Scenario: Users are shown the errors if they try to upload a csv containing quotes around the row
    Given I attempt to upload a csv containing quotes around the row
    Then I should see error messages stating why the csv has failed to upload

  Scenario: Users are able to upload a csv that has quotes around the values
    Given I attempt to upload a csv containing quotes around the column values
    Then I should see a flash message to state that new form is uploaded

  Scenario: Users are able to upload a csv that has spaces around the values
    Given I attempt to upload a csv containing spaces around the column values
    Then I should see a flash message to state that new form is uploaded

  Scenario: Checks cannot be uploaded twice
    When I upload a csv file
    And I attempt to upload the same csv again
    Then I should see an error stating it has already been uploaded


