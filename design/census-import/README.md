# Pupil Census Single Worker

Generates data in csv format, loads data from csv and performs bulk importing

## Instructions

- Generate school data by executing: `node generate-school-records.js -s 230`. Parameter s stands for number of schools
- Generate census csv by executing: `node generate-census-records.js -r 5000`. Parameter r stands for number of records
- Perform csv reading and bulk insertions by executing: `node index.js`. Optional parameter l stands for disabled lookup, omitting it will include school lookup in the log timers
- Inspect console logs to discover the duration for each phase