@upload_pupil_census
Feature:
  Upload Pupil Census

  Scenario: Pupil census page has a heading
    Given I am on the upload pupil census page
    Then I should see a heading on the pupil census page

  Scenario: Pupil census page has option to upload a file
    Given I am on the upload pupil census page
    Then I should see an option to upload a file

  Scenario: Pupil census page has a upload and cancel button
    Given I am on the upload pupil census page
    Then I should see upload and cancel buttons

  Scenario: Pupil census page has an uploaded file area
    Given I am on the upload pupil census page
    Then I should see an area where it displays files uploaded

  Scenario: Pupil census can be submitted
    Given I am on the upload pupil census page
    When I have chosen a file to submit
    Then I should see the file uploaded

  Scenario: Pupil census can be removed
    Given I have uploaded a pupil census file
    When I decide to remove the file
    Then it should be removed and the status updated

  Scenario: Pupils are removed from the register when the census has been deleted
    Given the pupil census file has been removed
    Then the pupils should be removed from the register