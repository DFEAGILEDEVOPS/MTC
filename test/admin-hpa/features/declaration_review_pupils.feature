@declaration_review_pupils_feature @hdf_hook
Feature: Declaration review pupils

  Background:
    Given I am logged in

  Scenario: Review pupils page displays as per the design
    And I am on the review pupil detail page
    Then I can see hdf review pupils page as per the design
