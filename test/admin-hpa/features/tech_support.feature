Feature:
  Tech support

  Scenario: Tech support users can login
    Given I have logged in with tech-support
    Then I should be taken to the tech support homepage
