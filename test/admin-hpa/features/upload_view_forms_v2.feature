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

  Scenario: Errors displayed no form or type is selected
    When I select to upload a new form
    And I submit without selecting a type or a form
    Then I should see an error stating I need to select a form and a type

  @remove_uploaded_forms
  Scenario Outline: Forms are tagged with their type
    When I have uploaded a valid <type> form
    Then it should be tagged as a <type> form

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario: Users can choose to overwrite an existing familirisation form
    When I have uploaded a valid familiarisation form
    And I decide to overwrite the existing familiarisation form by uploading a new familiarisation form
    Then the previous form should be replaced

  @remove_uploaded_forms
  Scenario: Users can choose to cancel overwriting an existing familirisation form
    When I have uploaded a valid familiarisation form
    And I decide to cancel overwriting the existing familiarisation form
    Then the previous form should be not overwritten

  @remove_uploaded_forms
  Scenario: Users can not upload 2 familiarisation forms at once
    When I attempt to upload 2 familiarisation forms
    Then I should be shown a validation error

  @remove_uploaded_forms
  Scenario: Users can upload multiple live forms at once
    When I attempt to upload 2 live forms
    Then they should be saved and tagged as a live form

  @remove_uploaded_forms
  Scenario: Users must upload a csv format file
    When I attempt to upload a file that is not csv file
    Then I should see an error stating the file is in an invalid format

  @remove_uploaded_forms
  Scenario: Users must upload a csv format file
    When I attempt to upload a file that is not csv file
    Then I should see an error stating the file is in an invalid format
