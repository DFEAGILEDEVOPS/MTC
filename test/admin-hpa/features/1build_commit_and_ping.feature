@build_commit_ping_feature @serial
Feature: Build and commit info

  Scenario: Check Admin app displays correct build and commit info
    Given I ping the admin app
    Then I should see the correct build and commit info

  Scenario: Check Pupil app displays correct build and commit info
    Given I ping the Pupil app
    Then I should see the correct build and commit info for the pupil app

  Scenario: Check Pupil API displays correct build and commit info
    Given I ping the Pupil API
    Then I should see the correct build and commit info
