#!/usr/bin/env node

const names = require('./../../admin/tables-queues.json')

const queues = names['queues']

queues.forEach(q => {
  console.log(q)
})
