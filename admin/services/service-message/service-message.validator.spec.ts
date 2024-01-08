import { ServiceMessageValidator, type ServiceMessageValidatorInput } from './service-message.validator'

describe('service-message.validator', () => {
  let serviceMessageInput: ServiceMessageValidatorInput
  beforeEach(() => {
    serviceMessageInput = {
      serviceMessageTitle: { fieldKey: 'serviceMessageTitle', fieldValue: 'title', errorMessage: 'title error' },
      serviceMessageContent: { fieldKey: 'serviceMessageContent', fieldValue: 'content', errorMessage: 'content error' },
      borderColourCode: { fieldKey: 'borderColourCode', fieldValue: 'B', errorMessage: 'borderColourCode error', allowedValues: ['B', 'Z'] },
      areaCode: { fieldKey: 'areaCode', fieldValue: ['P', 'G'], errorMessage: 'areaCode error', allowedValues: ['P', 'G', 'R'] }
    }
  })

  test('the test suite is providing a good message', () => {
    const verror = ServiceMessageValidator.validate(serviceMessageInput)
    expect(verror.hasError()).toBe(false)
  })

  test('it rejects an empty title', () => {
    serviceMessageInput.serviceMessageTitle.fieldValue = '' // empty title
    const verror = ServiceMessageValidator.validate(serviceMessageInput)
    expect(verror.get('serviceMessageTitle')).toBe('title error')
  })

  test('it rejects empty content', () => {
    serviceMessageInput.serviceMessageContent.fieldValue = '' // empty content
    const verror = ServiceMessageValidator.validate(serviceMessageInput)
    expect(verror.get('serviceMessageContent')).toBe('content error')
  })

  test('it accepts a valid border colour', () => {
    serviceMessageInput.borderColourCode.fieldValue = 'B' // valid
    const verror = ServiceMessageValidator.validate(serviceMessageInput)
    expect(verror.hasError()).toBe(false)
  })

  test('it rejects an invalid border colour', () => {
    serviceMessageInput.borderColourCode.fieldValue = 'Q' // invalid code
    const verror = ServiceMessageValidator.validate(serviceMessageInput)
    expect(verror.get('borderColourCode')).toBe('borderColourCode error')
  })

  test('it rejects an invalid area code', () => {
    serviceMessageInput.areaCode.fieldValue = ['Z'] // invalid code
    const verror = ServiceMessageValidator.validate(serviceMessageInput)
    expect(verror.get('areaCode')).toBe('areaCode error')
  })
})
