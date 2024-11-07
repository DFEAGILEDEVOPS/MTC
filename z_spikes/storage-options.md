#### Table Storage (classic)
- max property length of 32KB
- high performance
- low cost
- partition and row key fit well with school ID & check code

#### Cosmos SQL API
- Key/Value JSON store
- supports function bindings
- cost: TBC
- scale: TBC
- 'basic' container has a 10GB storage capacity and throughput of 400 request units per second, costing $0.033 USD per hour.
- supports multiple indexes
- 👎🏼 hard upper limit based on configured scale

#### BLOB Storage
- container per school, named by school UUID
- check persisted as `{checkCode}.json`
- cheap
- 👎🏼 no function bindings
- 👎🏼 complicated pricing (storage size, I/O rates, storage term)
 - 👎🏼 'dumb' container / no query functionality other than school UUID & checkCode

#### SQL Server
- managing schema / migrations
- effectively stores JSON as a blob
- 👎🏼 potentially expensive
- 👎🏼 no function bindings
- 👎🏼 hard upper limit based on configured scale
