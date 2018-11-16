@upload_view_forms
Feature: Upload and View Forms

  Background:
    Given I have signed in with test-developer
    And I am on the Upload and View forms page

  Scenario: Download usage report link is not displayed
    Then I should see no link to download an example usage report
    And I should see a heading on Upload and View forms page
    And I should have the option to upload new form

  Scenario: Upload new forms page matches design
    And I am on the Upload new forms page
    Then the upload new forms page matches design

  Scenario: Users can upload a csv file
    When I upload a csv file
    Then it should be added to the list of forms
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
    Then I should see error messages stating why the csv has failed to upload when I upload one of the following csv files
      | data/header-row.csv        |
      | data/minus-chars.csv       |
      | data/letters.csv           |
      | data/3-columns.csv         |
      | data/greater-than-12.csv   |
      | data/format.txt            |
      | data/decimals.csv          |
      | data/quotes-around-row.csv |

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


