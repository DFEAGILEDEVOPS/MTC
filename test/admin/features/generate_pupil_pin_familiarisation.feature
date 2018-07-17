@local @wip
Feature: Generate Pupil PINs Familiarisation

  @reset_all_pins
  Scenario: Generate pupil pin familiarisation is rendered as per design
    Given I have signed in with teacher2
    When I navigate to generate pupil pins familiarisation page
    Then I should see generate pin familiarisation overview page as per design
    And I can see instructions for generating pin for familiarisation

  Scenario: Generate Pins familiarisation Pupil List page display pupil with active pin
    Given I am logged in
    And I have a pupil with active pin
    And I am on the generate pupil pins familiarisation page
    When I click Generate PINs button
    Then I can see this pupil in the list of Pupil on Generate Pin familiarisation list page

  Scenario: Generate Pins familiarisation Pupil List Page display pupil not taking check
    Given I have a pupil not taking the check
    And I am on the generate pupil pins familiarisation page
    When I click Generate PINs button
    Then I can see this pupil in the list of Pupil on Generate Pin familiarisation list page