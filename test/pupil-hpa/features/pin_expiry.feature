@pin_expiry
Feature:
  Pin expiry after check has started

  @wip
  Scenario: Pin is not expired when pupil is on the practice complete page
    Given I am on the warm up complete page
    Then I should still have a valid pin
    When I start the check
    And I should see the check start time is recorded

  @local_storage
  Scenario: Pin is expired when pupil has started the check
    Given I have completed the check using the numpad
    Then I should have an expired pin
    Then I should see a check started event in the audit log

  @wip
  Scenario: Check start failure event is recorded in to the audit log
    Given I have lost my local storage
    When I completed the check anyway
    Then I should see a check start failure event recorded in the audit log
