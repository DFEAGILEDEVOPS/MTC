@edit_pupil_feature
Feature:
  As part of test development
  I want to be able to edit a pupil
  So that I that their details are up to date

  Background:
    Given I want to edit a previously added pupil

  Scenario: Edit details page has fields to capture pupil data
    Then I should see fields that will allow me to capture pupil data
    And the fields are pre populated with the data

  Scenario: Pupil data is updated when valid details are entered
    When I update with valid pupil data
    Then this should be saved
    And I should see a flash message to state the pupil has been updated
    And I should see the updated pupil details on the pupil register page

  Scenario: Pupil data is updated when valid details are entered with a temporary upn
    When I update with valid pupil data with a temporary upn
    Then this should be saved
    And I should see a flash message to state the pupil has been updated
    And I should see the updated pupil details on the pupil register page

  Scenario: Pupil data is not updated when invalid details are entered
    When I have submitted invalid pupil details
    Then the pupil details should not be updated

  Scenario: Validation errors are displayed when mandatory fields are not completed
    When I submit the form without the completing mandatory fields
    Then I should see validation errors

  Scenario: No validation errors are displayed when the optional fields are not completed
    When I submit the form without completing the optional fields
    Then I should be taken to the Pupil register page

  Scenario: Names can include a space
    When I submit the form with the name fields set as Mary Jane
    Then the pupil details should be stored

  Scenario: Users can navigate back to the profile page
    When I decide to go back
    Then I should be taken to the Pupil register page
    And I should see no flash message displayed

  Scenario: Names can only be a max of 128 characters long
    When I attempt to enter names that are more than 128 characters long
     Then I should see a validation error for first name

  Scenario: First names should contain at least 1 character long
    When I submit the form with a first name that is less than 1 character long
    Then I should see a validation error for first name

  Scenario: Last names should contain at least 1 character long
    When I submit the form with a last name that is less than 1 character long
    Then I should see a validation error for last name

  Scenario: Names can include a hyphen
    When I submit the form with the name fields set as Mary-Jane
    Then the pupil details should be stored

  Scenario: Names can include numbers
    When I submit the form with the name fields set as M4ry
    Then the pupil details should be stored

  Scenario: Names can include apostrophes
    When I submit the form with the name fields set as Mary'Jane
    Then the pupil details should be stored

  Scenario: Names can include accents
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

  Scenario: validation for edit Pupil DOB fields
    Then I should see validation error for the DOB field fo the following
      | condition                   |
      | letters in DOB              |
      | DOB in future               |
      | invalid day within a month  |
      | 3 digit day within a month  |
      | invalid month within a year |
      | 3 digit month within a year |
      | 5 digit year                |

  Scenario: DOB's can have a single digit day
    When I submit the form with a DOB that has 3 as the day of the month
    Then I should be taken to the Pupil register page

  Scenario: DOB's can have a single digit month
    When I submit the form with a DOB that has 1 as the month
    Then I should be taken to the Pupil register page

  Scenario: UPN cannot be assigned twice
    When I submit valid details with a already used UPN
    Then I should see an error stating more than 1 pupil with the same UPN

  Scenario: UPN cannot be assigned twice even with a space at the beginning
    When I submit valid details with a already used UPN with a space at the beginning
    Then I should see an error stating more than 1 pupil with the same UPN

  Scenario: Validation for Edit Pupil for UPN field
    Then I should see validation error for the UPN field for the following
      | condition                                |
      | wrong check letter                       |
      | invalid LA code                          |
      | alpha characters between characters 5-12 |
      | invalid alhpa character at position 13   |

  Scenario: Validation for Edit Pupil for UPN field when using a temporary upn
    Then I should see validation error for the UPN field when using a temporary upn for the following
      | condition                                |
      | wrong check letter                       |
      | invalid LA code                          |
      | alpha characters between characters 5-12 |
      | invalid alhpa character at position 13   |

  Scenario: UPN can have lowercase alpha characters
    When I submit valid details with a UPN has a lowercase alpha character
    Then the pupil details should be stored

  Scenario: Temporary UPN can have lowercase alpha characters
    When I submit valid details with a temporary UPN has a lowercase alpha character
    Then the pupil details should be stored

  Scenario: 11 year old pupils cannot be added
    When I submit the form with the pupil dob 11 years ago
    Then I should see an error with the DOB

  Scenario: 10 year old pupils can be added
    When I submit the form with the pupil dob 10 years ago
    Then the pupil details should be stored

  Scenario: 9 year old pupils can be added
    When I submit the form with the pupil dob 9 years ago
    Then the pupil details should be stored

  Scenario: 8 year old pupils can be added
    When I submit the form with the pupil dob 8 years ago
    Then the pupil details should be stored

  Scenario: 7 year old pupils can be added
    When I submit the form with the pupil dob 7 years ago
    Then the pupil details should be stored

  Scenario: 6 year old pupils cannot be added
    When I submit the form with the pupil dob 6 years ago
    Then I should see an error with the DOB

  @pupil_register_v2_hook
  Scenario: Redis cache is updated upon editing a pupil
    When I update with valid pupil data
    When I check the redis cache
    Then it should include the newly edited pupil
