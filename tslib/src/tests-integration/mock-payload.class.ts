import moment from 'moment'
import { faker } from '@faker-js/faker'
import type { DfEAbsenceCode, IPsychometricReportLine, IReportLineAnswer } from '../functions-ps-report/ps-report-3-transformer/models'
const schools = [
  'The New Learning Centre',
  'Shawcroft School',
  'Sussex House School',
  'Portland Place School',
  'Parkwood Hall School',
  'Elm Court School',
  'Bowden House School',
  'Burrow Hill School',
  'Gideon School',
  'Westminster Abbey Choir School',
  'Centre Academy London',
  'Wanstead House School',
  'Wembley Manor Junior School',
  'Crofton Hill Education Establishment',
  'Pinner Wood Middle School',
  'Cedars Middle School',
  'West Lodge Middle School',
  'St John\'s CofE Middle School',
  'The Purcell School',
  'Hounslow College',
  'Malmesbury Middle School',
  'Morden Farm Middle School',
  'Park House Middle School',
  'St Catherine\'s Catholic Middle School',
  'Lindsworth School',
  'Beacon Special School',
  'Grantside School',
  'Penkford School',
  'New Summerseat House School',
  'Chetham\'s School of Music',
  'Southern Cross School',
  'Oriel Bank',
  'Wheatley Middle School',
  'Wheatley Hills Middle School',
  'Hatfield Ash Hill Middle School',
  'Northfield Middle School',
  'Manor Middle School',
  'Green Lane Middle School',
  'Thorne Marshland Middle School',
  'Stainforth Middle School',
  'Intake Middle School',
  'Hexthorpe Middle School',
  'Balby Middle School',
  'Ellers Middle School',
  'Carr House Middle School',
  'Dunscroft Abbey CofE Middle School',
  'Fullerton House School',
  'Clayton Middle School',
  'Grange Middle School',
  'Great Horton Middle School',
  'Hutton Middle School',
  'Lapage Middle School',
  'Priestman Middle School',
  'Thorpe Middle School',
  'Undercliffe Middle School',
  'Whetley Middle School',
  'Woodroyd Middle School',
  'Frizinghall Middle School',
  'Drummond Middle School',
  'Waverley Middle School',
  'Heaton Middle School',
  'Manningham Middle School',
  'Gregory Middle School',
  'Delf Hill Middle School',
  'Eccleshill North Middle School',
  'Swain House Middle School',
  'Parkland Middle School',
  'Wellington Middle School',
  'Pollard Park Middle School',
  'Allerton Middle School',
  'Daisy Hill Middle School',
  'Fairweather Green Middle School',
  'Thornbury Middle School',
  'Leaventhorpe Middle School',
  'Ryan Middle School',
  'Swire Smith Middle School',
  'Highfield Middle School',
  'Hartington Middle School',
  'Holme Middle School',
  'Mandale Middle School',
  'Royd Mount Middle School',
  'Bronte Middle School',
  'Parkside Middle School',
  'Ladderbanks Middle School',
  'Burley Middle School',
  'Ilkley Middle School',
  'Nab Wood Middle School',
  'Stoney Lee Middle School',
  'Ryshworth Middle School',
  'Gilstead Middle School',
  'Woodend Middle School',
  'Belmont Middle School',
  'Addingham Middle School',
  'Buttershaw Middle School',
  'Wyke Middle School',
  'Woodside Middle School',
  'Lidget Green Middle School',
  'Worth Valley Middle School',
  'Calversyke Middle School',
  'Lower Fields Middle School',
  'Broomwood Middle School',
  'Hainsworth Moor Middle School',
  'Scotchman Middle School',
  'Wycliffe CofE Middle School',
  'Wibsey Middle School',
  'West End Middle School'
]

export class MockReportLineAnswer implements IReportLineAnswer {
  questionNumber: number | null = null
  id: string | null = null
  response: string | null = null
  inputMethods: string | null = null
  keystrokes: string | null = null
  score: number | null = null
  firstKey: moment.Moment | null = null
  lastKey: moment.Moment | null = null
  responseTime: number | null = null
  timeout: boolean | null = null
  timeoutResponse: boolean | null = null
  timeoutScore: boolean | null = null
  loadTime: moment.Moment | null = null
  overallTime: number | null = null
  recallTime: number | null = null
  questionReaderStart: moment.Moment | null = null
  questionReaderEnd: moment.Moment | null = null

  public constructor (questionNumber: number) {
    this.questionNumber = questionNumber
    this.id = `${questionNumber}x${questionNumber}`
    this.response = faker.datatype.number({ min: 0, max: 144 }).toString()
    this.inputMethods = faker.helpers.arrayElement(['k', 'm', 'p', 't', 'x'])
    this.keystrokes = this.response.split('').map(v => `${faker.helpers.arrayElement(['k', 'm', 'p', 't'])}[${v}]`).join(', ')
    this.score = faker.datatype.number({ min: 0, max: 100 }) > 75 ? 0 : 1
    this.firstKey = moment().subtract(faker.datatype.number({ min: 0, max: 100 }), 'minutes')
    this.lastKey = moment().subtract(faker.datatype.number({ min: 0, max: 100 }), 'minutes')
    this.responseTime = faker.datatype.number({ min: 0, max: 6000 }) / 1000
    this.timeout = faker.datatype.boolean()
    this.timeoutResponse = faker.datatype.boolean()
    this.timeoutScore = faker.datatype.boolean()
    this.loadTime = moment().subtract(faker.datatype.number({ min: 0, max: 100 }), 'minutes')
    this.overallTime = faker.datatype.number({ min: 1000, max: 9000 }) / 1000
    this.recallTime = faker.datatype.number({ min: 0, max: 6000 }) / 1000
    this.questionReaderStart = moment().subtract(faker.datatype.number({ min: 0, max: 100 }), 'minutes')
    this.questionReaderEnd = moment().subtract(faker.datatype.number({ min: 0, max: 100 }), 'minutes')
  }
}

type Sex = 'male' | 'female'

export class MockPayload implements IPsychometricReportLine {
  // Pupil
  PupilDatabaseId: number
  DOB: moment.Moment | null
  Gender: string
  PupilUPN: string
  Forename: string
  MiddleNames: string | null
  Surname: string
  ReasonNotTakingCheck: DfEAbsenceCode | null
  PupilStatus: string | null
  ImportedFromCensus: boolean
  IsEdited: boolean
  // School',
  SchoolName: string
  Estab: number | null
  SchoolURN: number | null
  LAnum: number | null
  ToECode: number | null
  // Settings
  QDisplayTime: number | null
  PauseLength: number | null
  AccessArr: string | null
  // Check
  AttemptID: string | null
  FormID: string | null
  TestDate: moment.Moment | null
  TimeStart: moment.Moment | null
  TimeComplete: moment.Moment | null
  TimeTaken: number | null // seconds with ms to 3 decimal places, e.g. 198.123
  RestartNumber: number | null
  RestartReason: number | null
  FormMark: number | null

  // Device
  BrowserType: string | null
  DeviceID: string | null

  answers: IReportLineAnswer[] = []

  public constructor () {
    this.PupilDatabaseId = faker.datatype.number({ min: 1, max: 750000 })
    this.PupilUPN = veryFakeUpn()
    const tenYearsAgo = moment().subtract(10, 'years')
    const nineYearsAgo = moment().subtract(9, 'years')
    this.DOB = moment.utc(faker.date.between({ from: tenYearsAgo.toDate(), to: nineYearsAgo.toDate() })).startOf('day')
    this.Gender = faker.helpers.arrayElement(['M', 'F'])
    const sex: Sex = this.Gender === 'M' ? 'male' : 'female'
    this.Forename = faker.person.firstName(sex)
    this.MiddleNames = faker.person.middleName(sex)
    this.Surname = faker.person.lastName(sex)
    this.ReasonNotTakingCheck = faker.helpers.arrayElement(['A', 'Z', 'L', 'U', 'B', 'J'])
    this.PupilStatus = faker.helpers.shuffle(['Incomplete', 'Complete', 'Not taking the Check'])[0]
    this.SchoolName = faker.helpers.arrayElement(schools)
    this.Estab = faker.number.int({ min: 1000, max: 9999 })
    this.SchoolURN = faker.number.int({ min: 89000, max: 89999 })
    this.LAnum = faker.number.int({ min: 201, max: 999 })
    this.QDisplayTime = faker.number.float({ min: 5.00, max: 9.00 })
    this.PauseLength = faker.number.float({ min: 3.00, max: 6.00 })
    this.AccessArr = faker.number.int({ min: 1, max: 6 }).toString()
    this.AttemptID = faker.string.uuid()
    this.FormID = faker.helpers.arrayElement(['MTC001', 'MTC002', 'MTC003', 'MTC004', 'MTC005', 'MTC006', 'MTC007'])
    this.TestDate = moment().subtract(13, 'minutes')
    this.TimeStart = moment().subtract(faker.number.int({ min: 1, max: 30 }), 'minutes')
    this.TimeComplete = moment()
    this.TimeTaken = (this.TimeComplete.valueOf() - this.TimeStart.valueOf()) / 1000
    this.RestartNumber = faker.number.int({ min: 0, max: 2 })
    this.RestartReason = faker.number.int({ min: 1, max: 4 })
    this.FormMark = faker.number.int({ min: 0, max: 25 })
    this.BrowserType = `${faker.lorem.words(2)} ${faker.system.semver()}`
    this.DeviceID = faker.string.uuid()
    this.ImportedFromCensus = faker.datatype.boolean()
    this.ToECode = faker.helpers.arrayElement([1, 2, 3, 5, 6, 7, 8, 42, 43, 44])
    this.IsEdited = faker.datatype.boolean()

    for (let i = 0; i < 25; i++) {
      const answer = new MockReportLineAnswer(i + 1)
      this.answers.push(answer)
    }
  }
}

export function veryFakeUpn (): string {
  const r = Math.random()
  return 'F'.concat(Math.ceil(r * 1000000000).toString())
}
