@declaration_form_feature @hdf_hook
Feature: Declaration form
  As a head teacher
  I need to submit the declaration form
  so I can confirm the check has been administered accordingly

  Background:
    Given I am logged in

  Scenario: HDF Form displays as per the design
    Given I am on the HDF form page
    Then I can see hdf form page as per the design

  Scenario: Names can only be a max of 128 characters long
    Given I am on the HDF form page
    When I attempt to enter hdf names that are more than 128 characters long
    Then I should see a validation error for names

  Scenario: Names should contain at least 1 character long
    Given I am on the HDF form page
    When I submit the form with names that are less than 1 character long
    Then I should see a validation error for names

  Scenario: Names can include a hyphen
    Given I am on the HDF form page
    When I submit the form with the hdf name fields set as Mary-Jane
    Then I should be taken to the attendance page

  Scenario: Names can include a space
    Given I am on the HDF form page
    When I submit the form with the hdf name fields set as Mary Jane
    Then I should be taken to the attendance page

  Scenario: Names can include numbers
    Given I am on the HDF form page
    When I submit the form with the hdf name fields set as M4ry
    Then I should be taken to the attendance page

  Scenario: Names can include apostrophes
    Given I am on the HDF form page
    When I submit the form with the hdf name fields set as Mary'Jane
    Then I should be taken to the attendance page

  Scenario: Names can include accents
    Given I am on the HDF form page
    When I submit the form with the hdf name fields set as Maryçáéíóúñü
    Then I should be taken to the attendance page

  Scenario: Names can not contain special characters
    Given I am on the HDF form page
    Then I should see validation errors when I submit with the following hdf names
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
    Given I am on the HDF form page
    When I submit the form with the hdf name fields set as <value>
    Then I should be taken to the attendance page

    Examples:
      | value              |
      | áàâãäåāæéèêēëíìîïī |
      | ÁÀÂÃÄÅĀÆÉÈÊĒËÍÌÎÏĪ |
      | ÓÒÔÕÖØŌŒÚÙÛÜŪŴÝŸŶ  |
      | óòôõöøōœúùûüūŵýÿŷ  |
      | ÞÐÇÑẞ              |
      | þçðñß              |

  Scenario: Job title is required when not a headteacher
    Given I am on the HDF form page
    When I click on the not a headteacher radio box
    And I submit the form with the hdf name fields set as Test
    Then I should see a validation error for job title

  @live_tio_expired_hook
  Scenario: HDF cannot be signed when a pupil has an expired pin and the live check window is closed
    Given I generate a live pin
    But the pin expires
    When the live check window closes
    Then I should not be able to sign the HDF

