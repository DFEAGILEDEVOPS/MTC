"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const checkMachine = xstate_1.Machine({
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
            type: "final"
        },
        rejected: {
            on: {
                RESTART: 'untaken'
            }
        }
    }
});
exports.default = checkMachine;
