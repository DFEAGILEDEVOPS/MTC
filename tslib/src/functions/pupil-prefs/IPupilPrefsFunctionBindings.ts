import { IPreparedCheckSyncMessage } from '../check-sync/IPreparedCheckSyncMessage'

export interface IPupilPrefsFunctionBindings {
  checkSyncQueue: Array<IPreparedCheckSyncMessage>
}
