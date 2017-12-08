@event_auditing
Feature: Event Auditing

  Scenario: Events are recorded into local storage
    Given I am on the complete page
    When I inspect local storage
    Then all the events should be captured

