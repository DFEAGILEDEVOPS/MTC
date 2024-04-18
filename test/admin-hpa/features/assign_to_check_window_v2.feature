@assign_to_check_window_feature @create_new_window_hook @serial
Feature:
  As a test developer
  I want to assign a window for a check form
  So that pupils can sit the check

  Background:
    Given I am logged in with a test developer
    And I am on the assign check window v2 page

  Scenario: Assign check window landing page displays information
    Then I should see assign check window v2 page as per design

  @upload_new_live_form_hook
  Scenario: Users can assign a live check form to a inactive window
    Then I can assign live check forms to inactive window

  @upload_new_fam_form_hook
  Scenario: Users can assign a familiarisation check form to a inactive window
    Then I can assign familiarisation check forms to inactive window

  Scenario: No live forms can be assigned to a active check window
    When I attempt to assign a live form to a active check window
    Then I should not be allowed to do so
    And form assigned to 'Live check' check window display 'yes'

  @upload_new_fam_form_hook
  Scenario: No fam forms can be assigned to a active check window
    When I attempt to assign a familiarisation form to a active check window
    Then I should not be allowed to do so
    And form assigned to 'Try it out' check window display 'yes'

  @upload_new_live_form_hook
  Scenario: Users can cancel assigning a live check form to a inactive window
    When I attempt to assign a live form to a inactive check window
    But decide to cancel assigning
    Then I should be taken back to the assign check window v2 page

  @upload_new_fam_form_hook
  Scenario: Users can cancel assigning a familiarisation check form to a inactive window
    When I attempt to assign a familiarisation form to a inactive check window
    But decide to cancel assigning
    Then I should be taken back to the assign check window v2 page

  @upload_new_live_form_hook
  Scenario: Users can assign a live form to multiple check windows
    Then I can assign live check forms to inactive window
    And I create another inactive check window
    And I should be able to assign the live form to another inactive window

  @upload_new_fam_form_hook
  Scenario: Users can assign a familiarisation form to multiple check windows
    Then I can assign familiarisation check forms to inactive window
    And I create another inactive check window
    And I should be able to assign the familiarisation form to another inactive window also

  @upload_new_live_form_hook
  Scenario: Users cannot remove assigned live forms
    When I can assign live check forms to inactive window
    Then I should not be able to remove the live check form

  @upload_new_fam_form_hook
  Scenario: Users cannot remove assigned familiarisation forms
    When I can assign familiarisation check forms to inactive window
    Then I should not be able to remove the live check form
