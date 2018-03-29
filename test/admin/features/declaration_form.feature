@manual @declaration_form
Feature: Declaration form
  As a head teacher
  I need to submit the declaration form
  so I can confirm the check has been administered accordingly

  Scenario: Once I confirm the attendance register , I should be on HDF
    Given there are pupils who attended the check
    And I have confirmed the pupils on attendance register
    Then I should see the Head teacher's declaration form

  Scenario: Confirm on the HDF form
    Given I am on the HDF form page
    When I confirm the HDF form
    Then I should taken to confirmation page

  Scenario: The signature should be self populated
    Given I am on the HDF form page
    Then I should see the main signatory is self populated

  Scenario: Confirmation of HDF forms takes to confirmation page
    Given I am on the HDF form page
    When I confirm the HDF form
    Then I should be taken to HDF confirmation page
    And I should be able to view results

  Scenario: Declination of HDF forms takes to confirmation page
    Given I am on the HDF form page
    When I decline the HDF form
    Then I should be taken to HDF confirmation page
    And I should be able to view results

  Scenario: Inline error message for job title
    Given I am on the HDF form page
    When I dont select any option and click submit
    Then I get an inline error message

  Scenario: Inline error message for entering more than 35 characters in job title
    Given I am on the HDF form page
    When I try to give more than 35 characters in job title
    Then I get an inline error message saying maximum chaeayer is

