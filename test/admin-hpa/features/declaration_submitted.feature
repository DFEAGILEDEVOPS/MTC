@reset_hdf_submission @declaration_submitted
Feature: Declaration form submitted

  Background:
    Given I have signed in with teacher4

  @hdf
  Scenario: Declaration submitted page displays as per the design
    Given I am on the declaration submitted page
    Then I can see the declaration submitted page as per the design

  @hdf
  Scenario: View declaration submitted form page displays as per the design when confirmed
    Given I am on the declaration submitted page
    And I click on view declaration form
    Then I am redirected to the declaration submitted form page
    And I can see the declaration submitted form page confirmed as per the design

  @hdf
  Scenario: View declaration submitted form page displays as per the design when not confirmed
    Given I am on the declaration submitted page with HDF submitted with unconfirmed status
    And I click on view declaration form
    Then I am redirected to the declaration submitted form page
    And I can see the declaration submitted form page not confirmed as per the design

  @pupil_not_taking_check @live_tio_expired
  Scenario: Submit HDF after check window is closed
    Given I have some pupils that have completed the check
    When the live check window closes
    And I set the remaining pupils as not taking the check
    Then I should be able to submit the HDF


