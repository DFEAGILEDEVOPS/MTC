@mod_schools_feature
Feature:
  MOD Schools

  Scenario: Settings for MOD schools page matches design
    Given I have signed in with service-manager
    When I navigate to the settings for MOD schools page
    Then i should see that the MOD schools page matches design

  @remove_mod_school_hook
  Scenario: Service manager can update a school to a mod school
    Given I am on the MOD schools page
    When I update a school to be of a different time zone
    Then the MOD schools page should reflect this

  Scenario: Service manager must enter a URN and school name which is in the census upload
    Given I am on the MOD schools page
    When I update a invalid school and urn
    Then I should see an error stating URN and school should be from the data set

  Scenario: Mod schools page lists schools that have an lea code of 702
    Given I have signed in with service-manager
    When I navigate to the settings for MOD schools page
    Then I should see a list of schools with the LEA code of 702

  @remove_mod_school_hook
  Scenario: Service manager can amend a schools timezone after it has been set
    Given I have updated a mod school to be of a different timezone
    When I decide to update it from the mod schools page
    Then the change should be reflected

