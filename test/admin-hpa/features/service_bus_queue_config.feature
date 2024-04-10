@service_bus_queue_config_feature @wip
Feature:
  Service Bus queue configuration

  Scenario Outline: Service bus config is correct
    Given I get the deployment config for service bus
    Then I should see the correct config for <name>

    Examples:
      | name                        |
      | check-completion            |
      | check-marking               |
      | check-notification          |
      | check-sync                  |
      | check-validation            |
      | ps-report-schools           |
      | ps-report-staging           |
      | ps-report-export            |
      | pupil-login                 |
      | queue-replay                |
      | school-results-cache        |
      | sync-results-to-db-complete |


  Scenario: Service bus queue names are listed in the config
    Given I get the deployment config for service bus
    Then the queues should match the expected queues
