export const EmergencyOffSwitchEnabledErrorCode = 'EMERGENCY_OFF_SWITCH_ENABLED'

export class EmergencyOffSwitchEnabledError extends Error {
  readonly code = EmergencyOffSwitchEnabledErrorCode

  constructor () {
    super('Pupil authentication is unavailable while the emergency off-switch is enabled')
    this.name = 'EmergencyOffSwitchEnabledError'
  }
}
