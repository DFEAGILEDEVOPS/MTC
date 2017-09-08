Feature:
  As part of test development
  I want to be able to add a pupil
  So that I that they can be assigned to a check

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
    Then I should be taken to the Manage a pupil page

  Scenario: DOB fields should not allow letters to be entered
    Given I am on the add pupil page
    When I attempt to type letters in the DOB fields
    Then they should not be entered

  Scenario: Users can navigate back to the profile page
    Given I am on the add pupil page
    When I decide to go back
    Then I should be taken to the Manage a pupil page

  Scenario: First names can only be a max of 35 characters long
    Given I am on the add pupil page
    When I attempt to enter a first name that is more than 35 characters long
    Then I should see only 35 characters are entered for first name

  Scenario: First names should contain at least 1 character long
    Given I am on the add pupil page
    When I submit the form with a first name that is less than 1 character long
    Then I should see a validation error for first name

  Scenario: Middle names can only be a max of 35 characters long
    Given I am on the add pupil page
    When I attempt to enter a middle name that is more than 35 characters long
    Then I should see only 35 characters are entered for middle name

  Scenario: Last names can only be a max of 35 characters long
    Given I am on the add pupil page
    When I attempt to enter a last name that is more than 35 characters long
    Then I should see only 35 characters are entered for last name

  Scenario: Last names should contain at least 1 character long
    Given I am on the add pupil page
    When I submit the form with a last name that is less than 1 character long
    Then I should see a validation error for last name

  Scenario: DOB's can not be in the future
    Given I am on the add pupil page
    When I submit the form with a DOB that is in the future
    Then I should see a validation error

  Scenario: Names can include a hyphen
    Given I am on the add pupil page
    When I submit the form with the name fields set as Mary-Jane
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