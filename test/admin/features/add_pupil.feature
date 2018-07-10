@add_pupil
Feature:
  As part of test development
  I want to be able to add a pupil
  So that I that they can be assigned to a check

  Background:
    Given I am logged in

  Scenario: Add Pupil Page displays as per the design
    Given I am on the add pupil page
    Then I can see add pupil page as per the design

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

  Scenario: validation for Add Pupil DOB fields
    Given I am on the add pupil page
    Then I should see validation error for the DOB field fo the following
      | condition                   |
      | letters in DOB              |
      | DOB in future               |
      | invalid day within a month  |
      | 3 digit day within a month  |
      | invalid month within a year |
      | 3 digit month within a year |
      | invalid year                |
      | 5 digit year                |

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

  Scenario: Validation for Add Pupil for UPN field
    Given I am on the add pupil page
    Then I should see validation error for the UPN field fo the following
      | condition                                |
      | wrong check letter                       |
      | invalid LA code                          |
      | alpha characters between characters 5-12 |
      | invalid alhpa character at position 13   |

  Scenario: UPN can have lowercase alpha characters
    Given I am on the add pupil page
    When I submit valid details with a UPN has a lowercase alpha character
    Then the pupil details should be stored
