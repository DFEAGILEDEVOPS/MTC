export class Pupil {
  firstName: String
  firstNameAlias: String
  lastName: String
  lastNameAlias: String
  dob: String
  checkCode: string
  inputAssistant: InputAssistant
}

export interface InputAssistant {
  firstName: String
  lastName: String
}

