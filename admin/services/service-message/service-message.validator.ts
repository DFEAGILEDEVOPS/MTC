import ValidationError from '../../lib/validation-error'

export interface IValidationInput {
  fieldKey: string
  fieldValue: string | Array<string>
  errorMessage: string
}

// Sigh.  There should be a better way to do this.
export class UserInterfaceValidator {
  public static validate (input: IValidationInput[]): ValidationError {
    return new ValidationError()
  }
}

export class SeviceMessageValidator implements UserInterfaceValidator {
  public static validate (inputs: IValidationInput[]): ValidationError {
    const validationError = new ValidationError()
    for (let input of inputs) {
      console.log('validating input', input)
    }
    return validationError
  }
}
