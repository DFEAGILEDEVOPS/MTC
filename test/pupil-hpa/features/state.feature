@state
Feature:
  State tracking

  Scenario: Refresh keeps user on sign in success page
    Given I am on the confirmation page
    When I attempt to refresh the page
    Then I should remain on the confirmation page

  Scenario: Refresh keeps user on instructions page
    Given I am on the instructions page
    When I attempt to refresh the page
    Then I should remain on the instructions page

  Scenario: Refresh keeps user on warm up intro page
    Given I am on the warm up intro page
    When I attempt to refresh the page
    Then I should remain on the warm up intro page

  Scenario: Refreshing the warm up question page loads the next warm up question
    Given I have refreshed through the warm up questions
    Then I should be taken to the warm up complete page

  Scenario: Refresh keeps user on warm up complete page
    Given I am on the warm up complete page
    When I attempt to refresh the page
    Then I should remain on the warm up complete page

  Scenario: Next question is loaded if user refreshes the question
    Given I have refreshed on every question page
    Then I should see the complete page after seeing all the questions
    And audit and inputs recorded should reflect this

  Scenario: Refresh keeps user on complete page
    Given I am on the complete page
    When I attempt to refresh the page
    Then I should remain on the complete page
