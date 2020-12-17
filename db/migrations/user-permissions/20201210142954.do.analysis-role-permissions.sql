GRANT SELECT ON SCHEMA ::[mtc_admin] TO [data_analysis_role]
GRANT SELECT ON SCHEMA ::[mtc_results] TO [data_analysis_role]
GRANT SELECT, UPDATE, INSERT, DELETE, EXECUTE, ALTER ON SCHEMA ::[mtc_analysis] TO [data_analysis_role]
GRANT CREATE VIEW TO [data_analysis_role]
