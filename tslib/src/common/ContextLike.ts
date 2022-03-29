import { ContextBindings, Logger } from '@azure/functions'

export interface IContextLike {
  bindings: ContextBindings
  log: Logger
}
