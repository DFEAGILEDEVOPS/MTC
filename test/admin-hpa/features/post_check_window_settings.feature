@post_check_window_settings
Feature:
  Service manager post check window settings

  Scenario: Ready only mode
    Given the admin window is closed
    And read only mode is enabled by the service manager
    Then teachers can only have read only access

  Scenario: Service unavailable mode
    Given the admin window is closed
    And service unavailable mode is enabled by the service manager
    Then teachers should see the service unavailable page

