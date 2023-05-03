@pupils_not_taking_check
Feature:
  Pupil not taking check

  Scenario: Pupil not taking check page is dispayed as per the design
    Given I am on the pupil not taking check page
    Then pupil not taking check page is displayed as per design

  Scenario: Pupil reason page is displayed as per the design
    Given I am on the pupil not taking check page
    When I want to add a reason
    Then pupil reason page is displayed as per the design

  Scenario: Pupils are sorted by using surname into ascending order by default
    Given I am logged in
    And I add a pupil with names beginning with Z
    When I want to add a reason for pupils not taking a check
    Then I should see a list of pupils sorted by surname

  Scenario: Pupils can be sorted by surname into descending order
    Given I am logged in
    And I add a pupil with names beginning with Z
    When I want to add a reason for pupils not taking a check
    And I want to sort the surnames in to desecending order
    Then I should see a list of pupils sorted by surname in descending order

  Scenario: Pupils can be selected by a checkbox
    Given I am on the pupil reason page
    Then I should be able to select them via a checkbox

  Scenario: Teachers can select all pupils
    Given I am on the pupil reason page
    Then I should have a option to select all pupils

  Scenario: Sticky banner is not displayed on pupil reason page if no reason or a pupil are selected
    Given I am on the pupil reason page
    Then I should not see a sticky banner

  Scenario: Sticky banner is displayed on pupil reason page when a reason and a pupil are selected
    Given I am on the pupil reason page
    And I select a reason
    When I select a pupil
    Then I should see a sticky banner

  @pupil_not_taking_check
  Scenario: Sticky banner displays pupil count
    Given I am on the pupil reason page
    When I select multiple pupils with the Incorrect registration reason
    Then the sticky banner should display the pupil count

  @pupil_not_taking_check
  Scenario: Sticky banner displays total pupil count when all pupils are selected for pupil not taking check
    Given I am on the pupil reason page
    And I select a reason
    When I select all pupil for pupil not taking check
    Then the sticky banner should display the total pupil count for pupil not taking the check

  Scenario: Confirmation is enabled if a reason and at least 1 pupil are selected
    Given I am on the pupil reason page
    And I select a reason
    When I select a pupil
    Then I should see the confirm button enabled

  Scenario: Cancel returns user to pupil not taking check page
    Given I have selected some pupils
    And I select a reason
    When I choose to cancel
    Then I should be taken to the pupil not taking check page

  @pupil_not_taking_check
  Scenario Outline: Teachers can add a reason for pupils not taking a check
    Given I am on the pupil reason page for new pupil
    When I add <reason> as a reason for a particular pupil
    Then the <reason> reason should be stored against the pupils
    And I should see the updated pupil on the hub page

    Examples:
      | reason                                         |
      | Incorrect registration                         |
      | Left school                                    |
      | Unable to access                               |
      | Working below expectation                      |
      | Just arrived and unable to establish abilities |

  @pupil_not_taking_check
  Scenario: Teachers can add multiple pupils
    Given I am on the pupil reason page for multiple new pupil
    When I add Incorrect registration as a reason for multiple pupils
    Then the reason should be stored against the pupils
    And I should see the updated pupils on the hub page

  @manual
  Scenario: Pupils can be sorted via reason
    Given I am on the pupil reason page
    Then I should be able to sort them via their reason for absence

  Scenario: Clicking on pupil name selects the pupil
    Given I am on the pupil reason page
    Then I should be able to select the pupils name to check the check box

  Scenario: Teachers can select all pupils
    Given I am on the pupil reason page
    Then I should be able to select all pupils

  @pupil_not_taking_check
  Scenario: List of pupils not taking check is displayed on the hub page
    Given I have previously added a reason for a pupil
    When I have navigated away and then return to the pupil not taking check page
    Then I should see a list of pupils

  @pupil_not_taking_check
  Scenario: Pupil reasons for not taking the check can be removed
    Given I have previously added a reason for a pupil
    When I have navigated away and then return to the pupil not taking check page
    And I remove a pupil from the list of pupils not taking a check
    Then the pupil should be removed and any attendance code cleared from the db against the pupil

  @pupil_not_taking_check
  Scenario: Message displayed when there are no pupils that are not taking the check
    Given I am on the pupil not taking check page
    Then I should see a message stating there are no pupils not taking the check

  @remove_all_groups
  Scenario: Pupils can be filtered by group
    Given I have a group of pupils
    When I choose to filter pupils via group on the pupil reason page
    Then only those pupils from the group should be displayed
    And I should be able to see a count of pupils in the group

  @remove_all_groups
  Scenario: Group filter is not displayed when there are no groups
    Given I am on the pupil reason page
    Then I should not see the group filter

  @remove_all_groups
  Scenario: Group filter is open by default
    Given I have a group of pupils
    Then the group filter should be opened by default

  Scenario: Pupil should not appear in the list of pupil for not taking the check after completed check
    Given I have single pupils for restart
    When I want to add a reason for pupils not taking a check
    Then I cannot see pupil in the list for pupil for not taking check

  Scenario: Pupil will again appear in the list of pupil for not taking the check after restart is selected and before pin generated
    Given I submitted pupils for Restart
    When I want to add a reason for pupils not taking a check
    Then I can see pupil in the list for pupil for not taking check

