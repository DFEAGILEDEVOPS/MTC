@results @redis
Feature: Results tests
  As a headteacher
  I need to see individual scores of pupils
  so i can assess the overall performance of my school

  Scenario: Provisional result Page in the first week of check end date and hdf is not submitted
    Given multiple pupils have completed the check
    When we are in 1st week of check end date
    And the data sync function has run
    Then we navigate to the Result page
    And I should see the provisional results page with a message stating the hdf needs to be signed

  Scenario: Viewing result Page in the second week of check end date and hdf is not submitted
    Given multiple pupils have completed the check
    When we are in 2nd week of check end date
    And the data sync function has run
    Then we navigate to the Result page
    And Result page is displayed as per the design

  @hdf
  Scenario: Results are viewable from the Monday after the check window has closed and the HDF signed
    Given multiple pupils have completed the check
    And the data sync function has run
    And we are in 1st week of check end date
    When I have submitted the HDF
    Then I should see the school results

  @hdf
  Scenario: Results are viewable from the second Monday after the check window has closed and the HDF has not been signed
    Given multiple pupils have completed the check
    And the data sync function has run
    And we are in 2nd week of check end date
    But I have not signed the hdf
    Then I should be able to view school results but not download the ctf

  @hdf
  Scenario: Not taking check reason, and the corresponding letter on CTF file, must show in the results page on place of the score
    Given multiple pupils have completed the check
    And some pupils who have been marked as not taking the check
    When the data sync function has run
    And we are in 1st week of check end date
    When I have submitted the HDF
    Then I should see the results and reasons for not taking the check

  @wip
  Scenario: Pupils with no over all score, or reason for not taking the check applied, the ctf file must show 'X'
    Given I have multiple pupils with no score or reason for not taking the check
    And multiple pupils have completed the check
    When the data sync function has run
    And the check window closed last friday
    And I have submitted the HDF
    Then I should see the results

  Scenario: If updates reason for not taking check (because HDF not signed) results and HDF must update accordingly
    Given I have multiple pupils with no score or reason for not taking the check
    And the data sync function has run
    And we are in 2nd week of check end date
    When a reason for not taking the check is applied to the pupils
    Then the HDF reflects these changes
    And the results reflect these changes
