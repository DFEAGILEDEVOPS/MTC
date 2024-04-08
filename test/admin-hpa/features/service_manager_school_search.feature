@service_manager_school_search
Feature:
  Service manager school search

  Scenario: Service manager can search for a school via DFE number
    Given I am on the search organisations page
    When I search for a valid DFE number
    Then I should see results relating to that school

  Scenario: Service manager can search for a school via URN
    Given I am on the search organisations page
    When I search for a valid URN
    Then I should see results relating to that school

  Scenario: Error is displayed when using an invalid DFE number
    Given I am on the search organisations page
    When I search for a invalid DFE number
    Then I should see an error stating the school does not exist

  Scenario: Error is displayed when using an invalid URN
    Given I am on the search organisations page
    When I search for a invalid URN
    Then I should see an error stating the school does not exist

  Scenario: Service managers can cancel the search
    Given I am on the search organisations page
    When I decide to cancel the search
    Then I am taken back to the manage organisations page

