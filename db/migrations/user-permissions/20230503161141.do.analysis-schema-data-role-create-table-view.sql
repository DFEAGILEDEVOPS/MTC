GRANT CREATE TABLE TO [data_analysis_role]
-- allow data analysis role to create foreign keys and view object definitions
GRANT REFERENCES, VIEW DEFINITION ON SCHEMA ::[mtc_analysis] TO [data_analysis_role]
