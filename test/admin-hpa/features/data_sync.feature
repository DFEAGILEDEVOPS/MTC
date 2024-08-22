@data_sync_feature @weekend_feature
Feature: Data Sync

  Scenario: Update check status on hard failures
    Given I have check which has resulted in a hard failure
    When the data sync function has run
    Then check should fail processing
    And the pupil should be available for a restart
