Feature:
  Data sync

  Scenario Outline: Answers events and inputs all match up
    Given I have completed the check with only <correct_answers> correct answers
    When the data sync function has run for a check
    Then all answers events and inputs match

    Examples:
      | correct_answers |
      | 0               |
      | 1               |
      | 3               |
      | 5               |
      | 8               |
      | 13              |
      | 21              |
      | 25              |

  @wip
  Scenario: All keyboard keys are recorded as inputs
    Given I have completed a check by selecting all keys on the keyboard
    When the data sync function has run for a check
    Then I should see all inputs recorded

  Scenario: Pupil takes check after scanning QR code
    Given I complete a check after scanning the QR code
    Then I should see the following QR code related events
      | QrCodeArrival |
      | LoginSuccess  |

  Scenario: Subsequent login after completed check using QR code
    Given I login after a completed QR check
    Then I should see the following QR code related events
      | QrCodeArrival         |
      | LoginSuccess          |
      | QrCodeSubsequentUsage |

  Scenario: QR events are still set even after refreshing whilst taking the check
    Given a pupil has refreshed during the check after the previous pupil completed the check
    Then I should see the following QR code related events
      | QrCodeArrival         |
      | LoginSuccess          |
      | QrCodeSubsequentUsage |

  Scenario: QR events are not recorded if the pupil didnt come from the QR code route
    Given I have completed the check without scanning the QR code
    Then I should see no QR code events

  Scenario: QR events not set if login page is refreshed
    Given I completed a check after scanning the QR code
    When I sign out and refresh the page
    And then login and complete the check
    Then I should see no QR code events

