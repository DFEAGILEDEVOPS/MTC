@declaration_review_pupils
Feature: Declaration review pupils

  Background:
    Given I have signed in with teacher3
    Given all pupils have completed the check

  Scenario: Review pupils page displays as per the design
    Given I am on the HDF review pupils page
    Then I can see hdf review pupils page as per the design