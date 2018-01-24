ALTER TABLE mtc_admin.[group] ADD school_id INT NOT NULL
ALTER TABLE mtc_admin.[group]
ADD CONSTRAINT group_school_id_fk
FOREIGN KEY (school_id) REFERENCES [mtc_admin].school (id)