import { interpret } from 'xstate'
import check from './check'

const checkService = interpret(check).onTransition(state =>
  console.log(state.value)
)

checkService.start()
checkService.send('ALLOCATE')
checkService.send('LOGIN')
checkService.send('RECEIVED')
checkService.send('PROCESSING_SUCCESS')
