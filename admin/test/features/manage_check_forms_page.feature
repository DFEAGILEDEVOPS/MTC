Feature:
  As a test developer
  I want to be able to manage check forms
  So that I can make the required changes to the check forms

  Background:
    Given I am logged in

  Scenario: Manage check forms page has a title
    Given I am on the manage check forms page
    Then I should see a heading

  Scenario: Manage check forms page has a option to choose a csv file
    Given I am on the manage check forms page
    Then I should have the option to choose a csv file

  Scenario: Manage check forms page has a option to remove a csv file
    Given I am on the manage check forms page
    Then I should have the option to remove a csv file

  Scenario: Manage check forms page has a option to upload a csv file
    Given I am on the manage check forms page
    Then I should have the option to upload a csv file

  @wip @fix-in-17402
  Scenario: Users can upload a csv file
    Given I am on the manage check forms page
    When I upload a csv file
    Then it should be added to the list of forms

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

  @wip @fix-in-17402
  Scenario: Users are able to upload a csv that has quotes around the values
    Given I attempt to upload a csv containing quotes around the column values
    Then it should be added to the list of forms

  @wip @fix-in-17402
  Scenario: Users are able to upload a csv that has spaces around the values
    Given I attempt to upload a csv containing spaces around the column values
    Then it should be added to the list of forms


