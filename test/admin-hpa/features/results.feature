@wip @results
Feature: Results tests
  As a headteacher
  I need to see individual scores of pupils
  so i can assess the overall performance of my school


  Scenario: Results page shows empty when there are no results
    Given there are no answers in database
    When I am on the results page
    Then I see an empty results page

  Scenario: View results
    Given I have populated some results in database
    When I am on the results page
    Then I see the pupil results
    And I should see the download csv option

  Scenario: Users can logout from results page
    Given I am on the results page
    When I decide to logout from results page
    Then I am taken back to the login page

  @manual
  Scenario: Verify the downloaded csv is in the right format
    Given I have populated some results in database
    When I click the download csv for the first result
    Then I should see that csv is downloaded
    And the csv file is in the right format


