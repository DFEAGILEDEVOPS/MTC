@ict_survey
Feature: ICT Survey

  Scenario: ICT Survey landing page is displayed as per design
    Given I am on the ICT Survey landing page
    Then ICT survey landing page is displayed as per design

  Scenario: Take preview before giving feedback
    Given I have taken the preview before giving feedback
    Then I am on the Preview completed page with Feedback link
