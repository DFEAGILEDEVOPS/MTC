@declaration_confirm_feature @hdf_hook
Feature: Declaration confirm and submit

  Background:
    Given I am logged in

  Scenario: Confirm and submit page displays as per the design
    Given I am on the confirm and submit page
    Then I can see the confirm and submit page as per the design

  Scenario: All four tick boxes must be checked
    Given I am on the confirm and submit page
    When I submit the form without ticking all three boxes
    Then I can see a validation error for confirm boxes

  Scenario: Submitted page loads when confirmed
    Given I am on the confirm and submit page
    When I submit the form with confirmation
    Then I am redirected to the submitted page

  @reset_hdf_submission_hook
  Scenario: Submitted page loads when not confirmed
    Given I am on the confirm and submit page
    When I submit the form without confirmation
    Then I am redirected to the submitted page
