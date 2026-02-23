export class Pupil {
  firstName: string
  firstNameAlias: string
  lastName: string
  lastNameAlias: string
  dob: string
  checkCode: string
  inputAssistant: InputAssistant
}

export interface InputAssistant {
  firstName: string
  lastName: string
}

