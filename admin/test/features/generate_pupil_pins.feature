@pupil_pin
Feature: Generate Pupil PINs


  Background:
    Given I am logged in
    And I am on the generate pupil pins page

  Scenario: Add Multiple Pupil Landing page displays heading and sub heading section
    Then I should see a heading for the Generate Pupil Pins
    And I can see the info message for generating the pupil pin
