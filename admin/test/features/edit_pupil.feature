Feature:
  As part of test development
  I want to be able to edit a pupil
  So that I that their details are up to date

  Background:
    Given I want to edit a previously added pupil

  Scenario: Edit details page has fields to capture pupil data
    Then I should see fields that will allow me to capture pupil data

  Scenario: Pupil data is updated when valid details are entered
    When I update with valid pupil data
    Then this should be saved

  Scenario: Pupil data is not updated when invalid details are entered
    When I have submitted invalid pupil details
    Then the pupil details should not be stored

  Scenario: Validation errors are displayed when mandatory fields are not completed
    When I submit the form without the completing mandatory fields
    Then I should see validation errors

  Scenario: No validation errors are displayed when the optional fields are not completed
    When I submit the form without completing the optional fields
    Then I should be taken to the Manage a pupil page

  Scenario: DOB fields should not allow letters to be entered
    When I attempt to type letters in the DOB fields
    Then they should not be entered

  Scenario: Names can include a space
    When I submit the form with the name fields set as Mary Jane
    Then the pupil details should be stored

  Scenario: Users can navigate back to the profile page
    When I decide to go back
    Then I should be taken to the Manage a pupil page

  Scenario: Names can only be a max of 128 characters long
    When I attempt to enter names that are more than 128 characters long
    Then I should see only 128 characters are saved

  Scenario: First names should contain at least 1 character long
    When I submit the form with a first name that is less than 1 character long
    Then I should see a validation error for first name

  Scenario: Last names should contain at least 1 character long
    When I submit the form with a last name that is less than 1 character long
    Then I should see a validation error for last name

  Scenario: DOB's can not be in the future
    When I submit the form with a DOB that is in the future
    Then I should see a validation error

  Scenario: Names can include a hyphen
    When I submit the form with the name fields set as Mary-Jane
    Then the pupil details should be stored

  Scenario: Names can include numbers
    When I submit the form with the name fields set as M4ry
    Then the pupil details should be stored

  Scenario: Names can include apostrophes
    When I submit the form with the name fields set as Mary'Jane
    Then the pupil details should be stored

  Scenario: Names can include apostrophes
    When I submit the form with the name fields set as Maryçáéíóúñü
    Then the pupil details should be stored

  Scenario: Names can not contain special characters
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

  Scenario: DOB's can not be an invalid day
    When I submit the form with a DOB that has 32 days in a month
    Then I should see a validation error for the day of the month

  Scenario: DOB's can not have a 3 digit day
    When I submit the form with a DOB that has 320 days in a month
    Then I should see a validation error for the day of the month

  Scenario: DOB's can not be an invalid month
    When I submit the form with a DOB that has 32 as the month
    Then I should see a validation error for the month of the year

  Scenario: DOB's can not have a 3 digit month
    When I submit the form with a DOB that has 320 as the month
    Then I should see a validation error for the month of the year

  Scenario: DOB's can not be an invalid year
    When I submit the form with a DOB that has 1000 years
    Then I should see a validation error for the year

  Scenario: DOB's can not have a 5 digit year
    When I submit the form with a DOB that has 20070 years
    Then I should see a validation error for the year

  Scenario: DOB's can have a single digit day
    When I submit the form with a DOB that has 3 days in a month
    Then I should be taken to the Manage a pupil page

  Scenario: DOB's can have a single digit month
    When I submit the form with a DOB that has 1 as the month
    Then I should be taken to the Manage a pupil page