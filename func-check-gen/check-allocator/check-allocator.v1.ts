// import * as myref from '../../ts-lib/src/example'
import * as mtclib from '@mtclib/example'

export class CheckAllocatorV1 {
  test () {
    const x = new mtclib.MeaningOfLife()
    return x.answer
  }
}
