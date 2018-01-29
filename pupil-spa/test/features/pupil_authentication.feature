@pupil_auth
Feature:
  Pupil auth

  Scenario: Pupil metadata is stored on successful login
    Given I have logged in
    Then I should see meta data stored in the DB

  @window_date_time_reset
  Scenario: Pupils can only login if they are assigned to a open check window
    Given I attempt to login whilst the check window is not open as the end date is in the past
    Then I should be taken to the sign in failure page

  @window_date_time_reset
  Scenario: Pupils cannot login if they are assigned to a check window with start date in future
    Given I attempt to login whilst the check window is not open as the start date is in the future
    Then I should be taken to the sign in failure page

  Scenario: No pupil meta data is stored when a pupil fails a login attempt
    Given I have failed to login
    Then I should see no pupil metadata stored
