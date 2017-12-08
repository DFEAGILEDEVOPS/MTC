@add_pupil
Feature:
  As part of test development
  I want to be able to add a pupil
  So that I that they can be assigned to a check

  Background:
    Given I am logged in

  Scenario: Add pupil page tells me what a UPN is
    Given I am on the add pupil page
    Then there should be a toggle that informs me what a upn is

  Scenario: What upn section should explain what a upn is
    Given I am on the add pupil page
    Then there should be text in the what a upn is section

  Scenario: What is upn section should have a link to more information
    Given I am on the add pupil page
    Then I should see a link to more details in the what is a upn section

  Scenario: Add pupil page has fields to capture pupil data
    Given I am on the add pupil page
    Then I should see fields that will allow me to capture pupil data

  Scenario: Add pupil page has fields to capture pupil data
    Given I am on the add pupil page
    Then I should see fields that will allow me to capture pupil data

  Scenario: Pupil data is stored when valid details are entered
    Given I am on the add pupil page
    When I have submitted valid pupil details
    Then the pupil details should be stored
    Then I should see a flash message to state the pupil has been added

  Scenario: Pupil data is not stored when invalid details are entered
    Given I am on the add pupil page
    When I have submitted invalid pupil details
    Then the pupil details should not be stored

  Scenario: Validation errors are displayed when mandatory fields are not completed
    Given I am on the add pupil page
    When I submit the form without the completing mandatory fields
    Then I should see validation errors

  Scenario: No validation errors are displayed when the optional fields are not completed
    Given I am on the add pupil page
    When I submit the form without completing the optional fields
    Then I should be taken to the Pupil register page

  Scenario: DOB fields should not allow letters to be entered
    Given I am on the add pupil page
    When I attempt to type letters in the DOB fields
    Then they should not be entered

  Scenario: Users can navigate back to the pupil register page
    Given I am on the add pupil page
    When I decide to go back
    Then I should be taken to the Pupil register page
    And I should see no flash message displayed

  Scenario: Names can only be a max of 128 characters long
    Given I am on the add pupil page
    When I attempt to enter names that are more than 128 characters long
    Then I should see a validation error for first name

  Scenario: First names should contain at least 1 character long
    Given I am on the add pupil page
    When I submit the form with a first name that is less than 1 character long
    Then I should see a validation error for first name

  Scenario: Last names should contain at least 1 character long
    Given I am on the add pupil page
    When I submit the form with a last name that is less than 1 character long
    Then I should see a validation error for last name

  Scenario: DOB's can not be in the future
    Given I am on the add pupil page
    When I submit the form with a DOB that is in the future
    Then I should see a validation error

  Scenario: DOB's can not be an invalid day within a month
    Given I am on the add pupil page
    When I submit the form with a DOB that has 32 days in a month
    Then I should see a validation error for the day of the month

  Scenario: DOB's can not have a 3 digit day within a month
    Given I am on the add pupil page
    When I submit the form with a DOB that has 320 days in a month
    Then I should see a validation error for the day of the month

  Scenario: DOB's can not be an invalid month within a year
    Given I am on the add pupil page
    When I submit the form with a DOB that has 32 as the month
    Then I should see a validation error for the month of the year

  Scenario: DOB's can not have a 3 digit month within a year
    Given I am on the add pupil page
    When I submit the form with a DOB that has 320 as the month
    Then I should see a validation error for the month of the year

  Scenario: DOB's can not be an invalid year
    Given I am on the add pupil page
    When I submit the form with a DOB that has 1000 years
    Then I should see a validation error for the year

  Scenario: DOB's can not have a 5 digit year
    Given I am on the add pupil page
    When I submit the form with a DOB that has 20070 years
    Then I should see a validation error for the year

  Scenario: DOB's can have a single digit day
    Given I am on the add pupil page
    When I submit the form with a DOB that has 3 days in a month
    Then I should be taken to the Pupil register page

  Scenario: DOB's can have a single digit month
    Given I am on the add pupil page
    When I submit the form with a DOB that has 1 as the month
    Then I should be taken to the Pupil register page

  Scenario: Names can include a hyphen
    Given I am on the add pupil page
    When I submit the form with the name fields set as Mary-Jane
    Then the pupil details should be stored

  Scenario: Names can include a space
    Given I am on the add pupil page
    When I submit the form with the name fields set as Mary Jane
    Then the pupil details should be stored

  Scenario: Names can include numbers
    Given I am on the add pupil page
    When I submit the form with the name fields set as M4ry
    Then the pupil details should be stored

  Scenario: Names can include apostrophes
    Given I am on the add pupil page
    When I submit the form with the name fields set as Mary'Jane
    Then the pupil details should be stored

  Scenario: Names can include apostrophes
    Given I am on the add pupil page
    When I submit the form with the name fields set as Maryçáéíóúñü
    Then the pupil details should be stored

  Scenario: Names can not contain special characters
    Given I am on the add pupil page
    Then I should see validation errors when i submit with the following names
      | F!rst  |
      | @ndrew |
      | £dward |
      | $imon  |
      | %ual   |
      | ^orman |
      | &bby   |
      | *lly   |
      | (iara  |
      | )iana  |
      | J_hn   |
      | A+aron |
      | Sh=ila |
      | [Shila |
      | ]sad   |
      | \an    |
      | ?who   |
      | >who   |
      | <who   |
      | who,   |

  Scenario Outline: Names can include some special characters
    Given I am on the add pupil page
    When I submit the form with the name fields set as <value>
    Then the pupil details should be stored

    Examples:
      | value              |
      | áàâãäåāæéèêēëíìîïī |
      | ÁÀÂÃÄÅĀÆÉÈÊĒËÍÌÎÏĪ |
      | ÓÒÔÕÖØŌŒÚÙÛÜŪŴÝŸŶ  |
      | óòôõöøōœúùûüūŵýÿŷ  |
      | ÞÐÇÑẞ              |
      | þçðñß              |

  @upn
  Scenario: UPN cannot be assigned twice
    Given I am on the add pupil page
    When I submit valid details with a already used UPN
    Then I should see an error stating more than 1 pupil with the same UPN

  Scenario: UPN has to have the correct check letter
    Given I am on the add pupil page
    When I submit valid details with a UPN that has a incorrect check letter
    Then I should see an error stating wrong check letter at character 1

  Scenario: UPN has to have a valid LA code
    Given I am on the add pupil page
    When I submit valid details with a UPN that has a invalid LA code
    Then I should see an error stating characters between 2-4 are invalid

  Scenario: UPN has to have numeric characters between characters 5-12
    Given I am on the add pupil page
    When I submit valid details with a UPN that has a alpha character between characters 5-12
    Then I should see an error stating characters between 5-12 are invalid

  Scenario: UPN has to have a valid alhpa character at position 13
    Given I am on the add pupil page
    When I submit valid details with a UPN that has a invalid alpha character at character 13
    Then I should see an error stating character 13 is invalid

  Scenario: UPN can have lowercase alpha characters
    Given I am on the add pupil page
    When I submit valid details with a UPN has a lowercase alpha character
    Then the pupil details should be stored
