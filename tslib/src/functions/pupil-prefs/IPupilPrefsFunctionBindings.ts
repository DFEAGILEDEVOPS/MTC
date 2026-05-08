import { type IPreparedCheckSyncMessage } from '../check-sync/IPreparedCheckSyncMessage'

export interface IPupilPrefsFunctionBindings {
  checkSyncQueue: IPreparedCheckSyncMessage[]
}
