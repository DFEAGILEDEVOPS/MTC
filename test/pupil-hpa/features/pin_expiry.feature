@pin_expiry_feature
Feature:
  Pin expiry after check has started

  Scenario: Pin is not expired when pupil is on the practice complete page
    Given I am on the warm up complete page
    Then I should still have a valid pin
    When I start the check
    And I should see the check start time is recorded

  @local_storage_hook
  Scenario: Pin is expired when pupil has started the check
    Given I have completed the check using the numpad
    Then I should have an expired pin
    Then I should see a check started event in the audit log

  Scenario: Pupils can generate a new pin after an unused pin has expired
    Given I have generated a live pin
    But the pin expires
    Then the pupil should be eligible for a live pin

  Scenario: Pin expires whilst pupils have a restart
    Given I generated a pin after applying a restart
    But the pin expires
    Then the pupil should be eligible for a live pin

  Scenario: Restart cannot be removed if pupil has logged in
    Given I generated a pin after applying a restart
    And I have logged in
    Then I should not see the remove restart button

  Scenario: Restart can not be removed if pupil has logged in and the pin expires
    Given I generated a pin after applying a restart
    And I have logged in
    And the pin expires
    Then I should not see the remove restart button
