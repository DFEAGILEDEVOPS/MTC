@tech_support
Feature:
  Tech support

  Scenario: Tech support users can login
    Given I have logged in with tech-support
    Then I should be taken to the tech support homepage

  Scenario: Check code has to be a valid UUID
    Given I am on the check view page
    When I enter a value that is not a valid UUID
    Then I should see an error stating the value is not valid

  Scenario: Check code is required
    Given I am on the check view page
    When I submit without entering a UUID
    Then I should see an error stating the UUID is required

  Scenario: Check summary is displayed when a checkcode is used taken from a completed check
    Given I have a checkCode from a completed check
    When I enter the checkCode from the completed check
    Then I should see the check summary

  Scenario: Processing error is displayed when a check is recieved but failed processing
    Given there is a processing error with a check
    When I enter the checkCode from the completed check
    Then I should see that the check failed processing

  Scenario: Marked and recieved checks can be viewed when a official check is completed
    Given a pupil has completed the Official check
    When I enter the checkCode from the completed check
    Then I should be able to view the links to the marked and recieved check

  Scenario: Marked and recieved checks are N/A when a try it out check is completed
    Given a pupil has completed the Try it out check
    When I enter the checkCode from the completed check
    Then I should see N/A for the marked and recieved check

  Scenario: Marked and recieved checks are N/A when a official pin has been generated
    Given a Official pin has been generated for a pupil
    When I enter the checkCode from the completed check
    Then I should see N/A for the marked and recieved check

  Scenario: Marked and recieved checks are N/A when a try it out pin has been generated
    Given a Try it out pin has been generated for a pupil
    When I enter the checkCode from the completed check
    Then I should see N/A for the marked and recieved check

