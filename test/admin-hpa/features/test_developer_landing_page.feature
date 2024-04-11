@test_developer_landing_feature
Feature: Test Developer Landing page

  Scenario: Test developers are taken to the service manager homepage
    Given I have signed in with test-developer
    Then I should be taken to the Test Developer homepage
    And the test developer homepage should match design


