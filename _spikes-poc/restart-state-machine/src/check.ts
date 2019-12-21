import { Machine } from 'xstate'

// states...
// untaken
// allocated
// collected
// submitted
// complete
// void

// events...
// ALLOCATE
// LOGIN
// RECEIVED
// PROCESSING_FAILED
// PROCESSING_SUCCESS
// VOID

const checkMachine = Machine({
  id: 'check',
  initial: 'untaken',
  context: {
    restarts: 0
  },
  states: {
    untaken: {
      on: {
        ALLOCATE: 'allocated'
      }
    },
    allocated: {
      on: {
        LOGIN: 'collected'
      }
    },
    collected: {
      on: {
        RECEIVED: 'submitted'
      }
    },
    submitted: {
      on: {
        PROCESSING_FAILED: 'void',
        PROCESSING_SUCCESS: 'complete'
      }
    },
    complete: {},
    void: {}
  }
})
