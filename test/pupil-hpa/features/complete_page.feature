@complete_page_feature
Feature: Complete page

  Scenario: Completion page matches design
    Given I am on the complete page
    Then I should see the complete page which matches design
    When I choose to sign out
    Then I should be taken back to the sign in page

  Scenario: Check complete is not shown until check has completed
    Given I attempt to directly navigate to the /check-complete
    Then I should be redirected to the sign in page
