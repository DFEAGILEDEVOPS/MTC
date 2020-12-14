REVOKE SELECT ON SCHEMA ::[mtc_admin] TO [data_analysis_role]
REVOKE SELECT ON SCHEMA ::[mtc_results] TO [data_analysis_role]
REVOKE SELECT, UPDATE, INSERT, DELETE, EXECUTE, ALTER ON SCHEMA ::[mtc_analysis] TO [data_analysis_role]
REVOKE CREATE VIEW TO [data_analysis_role]
