@results
Feature: Results tests
  As a headteacher
  I need to see individual scores of pupils
  so i can assess the overall performance of my school

  @result @redis
  Scenario: Viewing result Page in the first week of check end date and hdf is not submitted
    Given multiple pupil has completed the check
    When we are in 1st week of check end date without submitted HDF
    And we are on Result page
    Then Result page for no submitted hdf is displayed as per the design

  @manual @wip
  Scenario: Viewing result Page in the second week of check end date and hdf is not submitted
    Given multiple pupil has completed the check
    When we are in 2nd week of check end date without submitted HDF
    And we are on Result page
    Then Result page is displayed as per the design

