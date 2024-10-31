# Queue Messaging

Each message in the system is processed by a function that is dedicated to processing that queue.  Each function is housed under the `functions` folder.  Within a function folder is a `sample.data.json` file containing the current structure of the message.  Messages not conforming to the expected structure may end up on the poison queue if they cause an exception when being processed by its corresponding function.

## Poison queues

The poison queue is where 'bad' messages go once they have exceeded the maximum retry count.
Each queue has a corresponding poison queue which is automatically created the first time it is needed by the function.  The name of the poison queue is simply the name of the current queue with `-poison` appended to it.

## Inventory

| Queue | Publisher(s) | Subscriber |
|---|---|---|
| check-complete | `pupil-spa` | `functions/completed-checks` |
| check-started | `pupil-spa` | `functions/check-started` |
| prepare-check | `admin` | `functions/prepare-check` |
| pupil-feedback | `pupil-spa` | `functions/feedback` |
| pupil-prefs | `pupil-spa` | `functions/pupil-prefs` |
| pupil-status | TBD | `functions/pupil-status` |

A canonical definition of all queues and tables used for back-end processing is kept in [admin/tables-queues.json](/deploy/storage/tables-queues.json)
