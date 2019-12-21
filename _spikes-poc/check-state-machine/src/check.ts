import { Machine } from 'xstate'

// states...
// untaken
// allocated
// collected
// submitted
// complete
// rejected / invalid

// events...
// ALLOCATE
// LOGIN
// RECEIVED
// PROCESSING_FAILED
// PROCESSING_SUCCESS
// RESTART

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
        PROCESSING_FAILED: 'rejected',
        PROCESSING_SUCCESS: 'complete'
      }
    },
    complete: {
      type: "final" // can we restart after completion?
    },
    rejected: {
      on: {
        RESTART: 'untaken' // TODO context.restarts++
      }
    }
  }
})

export default checkMachine
