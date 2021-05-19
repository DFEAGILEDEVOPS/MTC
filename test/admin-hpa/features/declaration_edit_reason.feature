@declaration_edit_reason @hdf
Feature: Declaration edit attendance reason

  Background:
    Given I am logged in

  Scenario: Reason page for HDF pupil is displayed as per design
    Given I am on the review pupil detail page
    When headteacher updates the pupils reason for not taking a check
    Then reason page is displayed as per design
