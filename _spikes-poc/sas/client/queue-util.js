// var account = document.getElementById('account').value
var sas // = document.getElementById('sas').value
var msgCount = document.getElementById('message-count').value
var queue = ''
// var queueUri = ''
var encoder = new AzureStorage.Queue.QueueMessageEncoder.TextBase64QueueMessageEncoder()

function getSasToken () {
  var xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      sas = this.responseJSON
      console.log(sas)
    }
  }
  xhttp.open('POST', 'http://localhost:3000/auth', true)
  xhttp.send()
}

getSasToken()

function checkParameters () {
  // account = document.getElementById('account').value
  // sas = document.getElementById('sas').value
  queue = document.getElementById('queuename').value

/*   if (account == null || account.length < 1) {
    alert('Please enter a valid storage account name')
    return false
  } */
/*   if (sas == null || sas.length < 1) {
    alert('Please enter a valid SAS Token')
    return false
  } */

  if (queue == null || queue.length < 1) {
    alert('Please enter a valid queue name')
    return false
  }

  return true
}

function getQueueService () {
  // getSasToken()
  if (!checkParameters())
    return null

  // queueUri = 'https://' + account + '.queue.core.windows.net'
  var queueService = AzureStorage.Queue.createQueueServiceWithSas(sas.uri).withFilter(new AzureStorage.Queue.ExponentialRetryPolicyFilter())
  return queueService
}

function addMessage () {
  var queueService = getQueueService()
  if (!queueService)
    return

  if (queue == null || queue.length < 1) {
    alert('Please add queue name')
    return
  }

  var message = JSON.stringify(payload) // document.getElementById('message').value
  var encodedMessage = encoder.encode(message)
  var messageDisplay = document.getElementById('ui-messages')
  var errorCount = 0
  for (let index = 0; index < msgCount; index++) {
    queueService.createMessage(queue, encodedMessage, function (error, result, response) {
      if (error) {
        errorCount++
        console.log(error)
      }
    })
  }
  var successCount = msgCount - errorCount
  messageDisplay.innerText = successCount + ' messages pushed successfully. ' + errorCount + ' failed.'
}
