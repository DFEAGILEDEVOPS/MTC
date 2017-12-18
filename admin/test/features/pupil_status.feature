@wip
Feature: Pupil Status Outcome

  Scenario: Pupil status is Not Started when a new pupil is added
    Given I am on the add pupil page
    When I have submitted valid pupil details
    Then I can see the status for the pupil is 'Not started'

  Scenario: Pupil status is Not Started when PIN is expired

  Scenario: Pupil status is Pin Generated when PIN is generated and active
    Given I have generated a pin for a pupil
    When I am on the Pupil Register page
    Then I can see the status for the pupil is 'PIN generated'

  @manual
  Scenario: Pupil status is IN Progress when a pupil is logged in

  Scenario: Pupil status is Check Started when a pupil started the actual check
    Given I am on the add pupil page
    And I have submitted valid pupil details
    And Pupil has taken a 2nd check
    When I am on the Pupil Register page
    Then I can see the status for the pupil is 'Check started'

  @manual
  Scenario: Pupil status is Check Completed when a pupil completed its check

  Scenario: Pupil Status is Not Taking the Check when a pupil is not taking the check
    Given I have a pupil not taking the check
    When I am on the Pupil Register page
    Then I can see the status for the pupil is 'Not taking the Check'

  Scenario: Pupil Status is Restart when a Restart is taken and PIN not yet Generated
    Given I submitted pupils for Restart
    When I am on the Pupil Register page
    Then I can see the status for the pupil is 'Restart'


  Scenario Pupil status is Restart when a Restart is taken and PIN is expired
    Given I submitted pupils for Restart
