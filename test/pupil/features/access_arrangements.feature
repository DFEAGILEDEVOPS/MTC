@access_arrangement_setting @local
Feature: Access Arrangements

  Scenario: Setting page is displayed as per design
    Given I logged in with user with access arrangement 'Audible Time Alert,Remove on-screen number pad'
    Then I can see setting page as per design
    And I can see following access arrangement
      | access_arrangement_type |
      | Time alert              |
      | Remove number pad       |
