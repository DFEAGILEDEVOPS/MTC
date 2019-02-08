@reset_hdf_submission @declaration_submitted @hdf @local
Feature: Declaration form submitted

  Background:
    Given I have signed in with teacher4

  Scenario: Declaration submitted page displays as per the design
    Given I am on the declaration submitted page
    Then I can see the declaration submitted page as per the design

  Scenario: View declaration submitted form page displays as per the design when confirmed
    Given I am on the declaration submitted page
    And I click on view declaration form
    Then I am redirected to the declaration submitted form page
    And I can see the declaration submitted form page confirmed as per the design

  Scenario: View declaration submitted form page displays as per the design when not confirmed
    Given I am on the declaration submitted page with HDF submitted with unconfirmed status
    And I click on view declaration form
    Then I am redirected to the declaration submitted form page
    And I can see the declaration submitted form page not confirmed as per the design
