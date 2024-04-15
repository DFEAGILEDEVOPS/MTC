@declaration_edit_reason_feature @hdf_hook
Feature: Declaration edit attendance reason

  Background:
    Given I am logged in

  Scenario: Edit Reason for HDF pupil is displayed as per design
    Given I am on the review pupil detail page
    When headteacher select the pupil for updating its reason
    Then edit reason page is displayed as per design

  Scenario: Headteacher update the reason for a pupil
    Given headteacher has updated reason 'Left school' for a pupil
    Then reason is updated for the pupil on HDF review pupil detail page
