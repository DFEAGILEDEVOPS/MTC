import ValidationError from '../../lib/validation-error'

export interface IStringValidationInput {
  fieldKey: string
  fieldValue: string
  errorMessage: string
}

export interface IStringValidationInputWithAllowedValues extends IStringValidationInput {
  allowedValues: string[]
}

export interface IArrayValidationInputWithAllowedValues {
  fieldKey: string
  fieldValue: string[]
  errorMessage: string
  allowedValues: string[]
}

export interface ServiceMessageValidatorInput {
  serviceMessageTitle: IStringValidationInput
  serviceMessageContent: IStringValidationInput
  borderColourCode: IStringValidationInputWithAllowedValues
  areaCode: IArrayValidationInputWithAllowedValues
}

// Sigh.  There should be a better way to do this.
export class UserInterfaceValidator {
  public static validate (): ValidationError {
    return new ValidationError()
  }
}

function isEmptyString (s: string | string[] | undefined | null | boolean): boolean {
  if (typeof s === 'string') {
    if (s.trim() === '') return true
  }
  return false
}

function isAllowed (s: string | string[] | undefined | null, allowedValues: string[]): boolean {
  if (s === undefined || s === null) return false
  if (typeof s === 'string') {
    if (Array.isArray(allowedValues) && allowedValues.length > 0) {
      if (allowedValues.includes(s)) {
        return true
      }
    }
  }
  if (Array.isArray(s)) {
    // check each value is allowed
    const results = s.map(str => allowedValues.includes(str))
    return !results.includes(false)
  }
  return false
}

export class ServiceMessageValidator implements UserInterfaceValidator {
  public static validate (input: ServiceMessageValidatorInput): ValidationError {
    const validationError = new ValidationError()
    // Check the Title is not empty
    if (isEmptyString(input.serviceMessageTitle.fieldValue)) {
      validationError.addError(input.serviceMessageTitle.fieldKey, input.serviceMessageTitle.errorMessage)
    }
    // check the content is not emtpy
    if (isEmptyString(input.serviceMessageContent.fieldValue)) {
      validationError.addError(input.serviceMessageContent.fieldKey, input.serviceMessageContent.errorMessage)
    }
    // check the border colour is an allowed value
    if (!isAllowed(input.borderColourCode.fieldValue, input.borderColourCode.allowedValues)) {
      validationError.addError(input.borderColourCode.fieldKey, input.borderColourCode.errorMessage)
    }
    // check the area code(s) are allowed
    if (!isAllowed(input.areaCode.fieldValue, input.areaCode.allowedValues)) {
      validationError.addError(input.areaCode.fieldKey, input.areaCode.errorMessage)
    }
    return validationError
  }
}
