@upload_view_forms_feature @remove_assigned_form_hook
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
    Then I submit without selecting a type or a form
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
    Then I decide to overwrite the existing familiarisation form by uploading a new familiarisation form
    Then the previous form should be replaced

  @remove_uploaded_forms
  Scenario: Users can choose to cancel overwriting an existing familirisation form
    When I have uploaded a valid familiarisation form
    Then I decide to cancel overwriting the existing familiarisation form
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

  @remove_uploaded_forms
  Scenario Outline: Users must upload a csv with exactly 25 rows of data
    When I attempt to upload a <type> file that is not exactly 25 rows of data
    Then I should see an error stating the <type> file needs to be 25 rows of data
    But when I correct the <type> file to have exactly 25 rows of data
    Then the <type> file should be uploaded

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario Outline: Users must upload a csv with exactly 50 integers
    When I attempt to upload a <type> file that is not exactly 50 integers
    Then I should see an error stating the <type> file needs to be exactly 50 integers
    But when I correct the <type> file to have exactly 50 integers
    Then the <type> file should be uploaded

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario Outline: Users must upload a csv with exactly 2 columns
    When I attempt to upload a <type> file that is not exactly 2 columns
    Then I should see an error stating the <type> file needs to be exactly 2 columns
    But when I correct the <type> file to have exactly 2 columns
    Then the <type> file should be uploaded

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario Outline: Users must upload a csv with only integers, commas and quotation marks
    When I attempt to upload a <type> file that doesnt only contain integers, commas and quotation marks
    Then I should see an error stating the <type> file has to only contain integers, commas and quotation marks
    But when I correct the <type> file to have only integers, commas and quotation marks
    Then the <type> file should be uploaded

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario Outline: Users must upload a csv with only integers between 1 and 12
    When I attempt to upload a <type> file that doesnt only contain integers between 1 and 12
    Then I should see an error stating the <type> file has to only contain integers between 1 and 12
    But when I correct the <type> file to have only integers between 1 and 12
    Then the <type> file should be uploaded

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario Outline: Users must upload a csv with a file name between 1 and 128 characters long
    When I attempt to upload a <type> file with a file name greater than 128 characters long
    Then I should see an error stating the <type> file name has to be between 1 and 128 characters long
    But when I correct the <type> file name to be between 1 and 128 characters long
    Then the <type> file should be uploaded

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario: Users can upload a max of 10 files at a time
    When I attempt to upload more than 10 live files at one time
    Then I should see an error stating the max to upload is 10
    But when I choose 10 live files
    Then the live files should be uploaded


  @remove_uploaded_forms
  Scenario Outline: Users cant upload a file when the file name is a duplicate of one already uploaded
    When I attempt to upload a <type> file with the same file name as one previously uploaded
    Then I should see an error stating the <type> file name is a duplicate
    But when I correct the <type> file to not be a duplicate file name
    Then the <type> file should be uploaded

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms @manual
  Scenario: Users cant overwrite fam form if one has already been assigned
    When I attempt to upload a new familiarisation form whilst the existing familiraisation form has already been assigned
    Then I should see an error stating the familirisation form has already been assigned to a window


  @remove_uploaded_forms
  Scenario Outline: Uploaded forms are displayed on the view forms page
    When I have uploaded a valid <type> form
    Then it should be displayed as a <type> form on the view forms page

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario Outline: Uploaded forms are displayed on the view forms page
    When I have uploaded a valid <type> form
    Then i should be able to delete the <type> form

    Examples:
      | type            |
      | live            |
      | familiarisation |

  @remove_uploaded_forms
  Scenario Outline: Users cannot re upload a deleted form if the file name has not changed
    When I have uploaded a valid <type> form
    But I delete the <type> form
    When I try to reupload the same <type> form
    Then I should be shown an error stating the <type> file is a duplicate


    Examples:
      | type            |
      | live            |
      | familiarisation |


  @remove_uploaded_forms
  Scenario: Users cannot remove an assigned form
    Then there should be no way to remove a assigned form


