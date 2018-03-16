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

  @local_storage
  Scenario Outline: Next question is loaded if user refreshes on the question page
    Given I am on question <number> of the check
    And I attempt to refresh the page
    But the next question has loaded so I continue with the check
    Then the audit and inputs recorded should reflect this

    Examples:
      | number |
      | 1      |
      | 2      |
      | 3      |
      | 4      |
      | 5      |
      | 6      |
      | 7      |
      | 8      |
      | 9      |
      | 10     |

  Scenario: Refresh keeps user on complete page
    Given I am on the complete page
    When I attempt to refresh the page
    Then I should remain on the complete page
