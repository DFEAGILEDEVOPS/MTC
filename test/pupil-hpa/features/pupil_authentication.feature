@pupil_auth_feature
Feature:
  Pupil auth

  @generate_live_pin_hook
  Scenario: Pupil metadata is stored on successful login
    Given I have logged in
    Then I should see meta data stored in the DB

  @window_date_time_reset_hook @wip
  Scenario: Pupils can only login if they are assigned to a open check window
    Given I attempt to login whilst the check window is not open as the end date is in the past
    Then I should see a failed login message

  @window_date_time_reset_hook @wip
  Scenario: Pupils cannot login if they are assigned to a check window with start date in future
    Given I attempt to login whilst the check window is not open as the start date is in the future
    Then I should see a failed login message

  Scenario: No pupil meta data is stored when a pupil fails a login attempt
    Given I have attempted to enter a school I do not attend upon login
    Then I should see no pupil metadata stored
