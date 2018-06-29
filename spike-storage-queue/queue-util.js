var account = document.getElementById('account').value;
var sas = document.getElementById('sas').value;
var queue = '';
var queueUri = '';
var encoder = new AzureStorage.Queue.QueueMessageEncoder.TextBase64QueueMessageEncoder();

function checkParameters() {
    account = document.getElementById('account').value;
    sas = document.getElementById('sas').value;
    queue = document.getElementById('queuename')

    if (account == null || account.length < 1)
    {
        alert('Please enter a valid storage account name');
        return false;
    }
    if (sas == null || sas.length < 1)
    {
        alert('Please enter a valid SAS Token');
        return false;
    }

    if (queue == null || queue.length < 1)
    {
        alert('Please enter a valid queue name');
        return false;
    }

    return true;
}

function getQueueService() {
    if (!checkParameters())
        return null;

    queueUri = 'https://' + account + '.queue.core.windows.net/' + queue;
    var queueService = AzureStorage.Queue.createQueueServiceWithSas(queueUri, sas).withFilter(new AzureStorage.Queue.ExponentialRetryPolicyFilter());
    return queueService;
}

function addMessage() {
    var queueService = getQueueService();
    if (!queueService)
        return;
    
    if (queue == null || queue.length < 1) {
        alert('Please select a queue from queue list!')
        return;
    }

    var message = document.getElementById('newmessage').value;
    var messageDisplay = document.getElementById('ui-messages')
    queueService.createMessage(queue, encoder.encode(message), function(error, result, response) {
        if(error) {
            messageDisplay.innerText = 'error creating message:' + result;
            console.log(error);
        } else {
            messageDisplay.innerText = 'Create message successfully!';
        }
    });
}
