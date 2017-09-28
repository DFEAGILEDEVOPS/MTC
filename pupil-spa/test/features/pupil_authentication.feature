Feature:
  Pupil auth


  Scenario: Pupil metadata is stored on successful login
    Given I have logged in
    Then I should see meta data stored in the DB

  @end_date_reset
  Scenario: Pupils can only login if they are assigned to a open check window
    Given I attempt to login whilst the check window is not open
    Then I should be taken to the sign in failure page

  Scenario: No pupil meta data is stored when a pupil fails a login attempt
    Given I have failed to login
    Then I should see no pupil metadata stored



