@retro_input_assistant_feature
Feature:
  Retrospective input assistance

  Scenario: Retro input assistant only applies to current check
    Given I have retrospectively added an input assistant
    When I complete a check after a restart
    Then I should not have any retro input assistant recorded against the current check


