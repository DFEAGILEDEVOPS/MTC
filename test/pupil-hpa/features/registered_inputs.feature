@registered_inputs_feature
Feature: Registered Inputs


  Scenario: All inputs are recorded when using the on screen keyboard
    Given I have used all the keys on the on screen keyboard to complete the check
    Then I should see all my number pad inputs recorded

  Scenario: All numerical inputs are recorded when using the physical keyboard
    Given I have used the physical screen keyboard to complete the check
    Then I should see all my keyboard inputs recorded

  Scenario: Backspace is recorded when using the on screen keyboard
    Given I have used backspace to correct my answer using the on screen keyboard
    Then I should see backspace numpad event recorded

  Scenario: Backspace is recorded when using the physical keyboard
    Given I have used backspace to correct my answer using the physical keyboard
    Then I should see backspace keyboard event recorded
