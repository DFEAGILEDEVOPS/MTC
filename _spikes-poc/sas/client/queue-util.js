// var account = document.getElementById('account').value
var sas // = document.getElementById('sas').value
var msgCount = document.getElementById('message-count').value
var queue = ''
// var queueUri = ''
var encoder = new AzureStorage.Queue.QueueMessageEncoder.TextBase64QueueMessageEncoder()

function getSasToken () {
  var url = 'http://localhost:3000/auth'
  var dataType = 'json'
  var contentType = 'application/json; charset=utf-8'
  $.ajax({
    type: 'POST',
    url: url,
    data: null,
    success: processSas,
    dataType: dataType,
    contentType: contentType
  })
}

function processSas (data) {
  console.dir(data)
  document.getElementById('sas-token').value = data.token
  sas = data
}

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
  var queueService = AzureStorage.Queue.createQueueServiceWithSas(sas.url.replace(queue, ''), sas.token).withFilter(new AzureStorage.Queue.ExponentialRetryPolicyFilter())
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
  messageDisplay.innerText = ''
  for (let index = 0; index < msgCount; index++) {
    queueService.createMessage(queue, encodedMessage, function (error, result, response) {
      if (error) {
        messageDisplay.innerText = 'errors occured. see console for details'
        console.log(error)
      }
    })
  }
/*   var successCount = msgCount - errorCount
  messageDisplay.innerText = successCount + ' messages pushed successfully. ' + errorCount + ' failed.' */
}
