@groups_feature @remove_all_groups_hook
Feature:
  Pupil groups

  Scenario: Groups page is displayed as per the design
    Given I am on the groups page
    Then the group page is displayed as per the design

  Scenario: Groups page has a table of existing groups
    Given groups have been previoulsy created
    Then I should see a table of existing groups

  Scenario: Groups are stored in the DB
    Given I have created a group with 5 pupils
    Then I should the group stored in the DB

  Scenario: Group name must be at least 1 character
    Given I am on the create group page
    When group name is left empty
    Then I should not see the stick banner

  Scenario: Group name cannot be longer than 35 characters
    Given I am on the create group page
    When group name is longer than 35 characters
    Then I should see a validation error for the group name

  Scenario: Group names cannot contain special characters
    Given I am on the create group page
    Then I should see validation errors for group name when I enter the following special characters
      | F!rst  |
      | @ndrew |
      | £dward |
      | $imon  |
      | %ual   |
      | ^orman |
      | &bby   |
      | *lly   |
      | (iara  |
      | )iana  |
      | J_hn   |
      | A+aron |
      | Sh=ila |
      | [Shila |
      | ]sad   |
      | \an    |
      | ?who   |
      | >who   |
      | <who   |
      | who,   |

  Scenario: Group names can have some special characters
    Then I can enter the following special characters as the group name
      | áàâãäåāæéèêēëíìîïī |
      | ÓÒÔÕÖØŌŒÚÙÛÜŪŴÝŸŶ  |
      | þçðñß              |

  Scenario: List of pupils excludes pupils already assigned to another group
    Given I have added already added a pupil to another group
    When I want to create a new group
    Then I should not see pupils who are assigned to another group

  Scenario: Teachers can select pupils 1 by 1
    Given I am on the create group page
    When I select 2 pupils
    Then the sticky banner count should reflect this

  Scenario: Teachers can select all pupils
    Given I am on the create group page
    When I select all pupils
    Then the sticky banner count should reflect that all pupils have been selected

  Scenario: Teachers can un select pupils
    Given I have selected all the pupils on the create group page
    When I decide to unselect them all
    Then the sticky banner should disappear

  Scenario: Sticky banner is shown when a valid group name is given and at least 1 pupil is selected
    Given I am on the create group page
    When I enter a valid group name
    And select a pupil
    Then I should see the sticky banner

  Scenario: Users can edit the pupil list in a previously created group
    Given I want to edit a previously added group
    Then I should be able to add and remove pupils

  Scenario: Group names can be edited
    Given I want to edit a previously added group
    Then I should be able to edit the group name

  Scenario: Duplicate group name validation
    Given I have created a group
    Then I should see error for group name for the following
      | condition                                |
      | duplicate group name                     |
      | duplicate group name with different case |

  Scenario: Cancel in the sticky banner returns the user to the previous page
    Given I can see the sticky banner
    When decide to cancel creating a group
    Then I should be returned to the group hub page

  Scenario: Groups can be removed
    Given I have created a group
    Then I should be able to remove the group

  Scenario: Removing a group can be cancelled
    Given I have created a group
    When I choose to remove the group
    But decide against it and cancel
    Then the group should not be removed

  Scenario: Number of pupils in the group is displayed next to the group name
    Given I have created a group
    Then I should see the number of pupils in that group on the group hub page

  Scenario: DOB is displayed for pupils with the same names
    Given I add 2 pupil with same firstname and lastname and different dob
    Then dob is displayed for the 2 pupil on group pupil list page

  Scenario: Middle name is displayed when pupils have the same name and DOB
    Given I add 2 pupil with same firstname lastname and same dob
    Then middle name is displayed for the 2 pupil on group pupil list page
