@service_manager_school_audit_feature @new_school_no_password_hook @serial
Feature:
  Service manager school audit

  Scenario: Creation of a school triggers an audit entry
    Given I have created a school
    When I view audit history of the school
    Then I should see an insert entry

  Scenario: Updating the name triggers an audit entry
    Given I have updated the name of a school
    When I view audit history of the school
    Then I should see an update entry for updating the name

  Scenario: Generating password triggers an audit entry
    Given I have generated a password for a school
    When I view audit history of the school
    Then I should seen an update entry for generating a password

  Scenario: Updating the Dfe number triggers an audit entry
    Given I have updated the Dfe number for a school
    When I view audit history of the school
    Then I should seen an update entry for updating the Dfe number

  Scenario: Updating the URN triggers an audit entry
    Given I have updated the URN for a school
    When I view audit history of the school
    Then I should seen an update entry for updating the URN

  Scenario: Updating the LEA code triggers an audit entry
    Given I have updated the LEA code for a school
    When I view audit history of the school
    Then I should seen an update entry for updating the LEA code

  Scenario: Updating the Estab code triggers an audit entry
    Given I have updated the Estab code for a school
    When I view audit history of the school
    Then I should seen an update entry for updating the Estab code

  Scenario: Updating the type of Estab triggers an audit entry
    Given I have updated the type of Estab for a school
    When I view audit history of the school
    Then I should seen an update entry for updating the type of Estab


