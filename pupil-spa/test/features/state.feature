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
