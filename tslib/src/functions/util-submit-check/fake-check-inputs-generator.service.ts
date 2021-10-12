import moment from 'moment'
import { CompleteCheckAnswer, CompleteCheckInputEntry, InputEventType } from '../../schemas/check-schemas/validated-check'

export class FakeCheckInputsGeneratorService {
  create (answers: CompleteCheckAnswer[]): CompleteCheckInputEntry[] {
    const inputs = new Array<CompleteCheckInputEntry>()
    for (let index = 0; index < answers.length; index++) {
      const answer = answers[index]
      const answerString = answer.answer.toString()
      for (let index = 0; index < answerString.length; index++) {
        const char = answerString.charAt(index)
        inputs.push({
          input: char,
          clientTimestamp: moment().toISOString(),
          eventType: InputEventType.KeyDown,
          question: `${answer.factor1}x${answer.factor2}`,
          sequenceNumber: answer.sequenceNumber,
          relativeTiming: '+0'
        })
      }
      inputs.push({
        input: 'Enter',
        clientTimestamp: moment().toISOString(),
        eventType: InputEventType.KeyDown,
        question: `${answer.factor1}x${answer.factor2}`,
        sequenceNumber: answer.sequenceNumber,
        relativeTiming: '+0'
      })
    }
    return inputs
  }
}
