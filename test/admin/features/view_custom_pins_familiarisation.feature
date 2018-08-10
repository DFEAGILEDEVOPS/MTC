@view_custom_pins_familiarisation @generate_pupil_pins @reset_all_pins @reset_checks
Feature: View custom pins familiarisation

  Scenario: Familiarisation view and custom print pin page is displayed as per design
    Given I am on the familiarisation custom print page
    Then I should see the familiarisation custom print page matches design

  @remove_all_groups
  Scenario: Pupils can be filtered by group
    Given I have generated familiarisation pins for all pupils in a group
    And I have generated familiarisation pins for pupils without a group
    When I navigate to the familiarisation custom print page
    Then I should be able to filter and print the pupils in the group
