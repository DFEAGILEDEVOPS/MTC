var account = document.getElementById('account').value;
var sas = document.getElementById('sas').value;
var queue = '';
var queueUri = '';
var encoder = new AzureStorage.Queue.QueueMessageEncoder.TextBase64QueueMessageEncoder();

function checkParameters() {
    account = document.getElementById('account').value;
    sas = document.getElementById('sas').value;

    if (account == null || account.length < 1)
    {
        alert('Please enter a valid storage account name!');
        return false;
    }
    if (sas == null || sas.length < 1)
    {
        alert('Please enter a valid SAS Token!');
        return false;
    }

    return true;
}

function getQueueService() {
    if (!checkParameters())
        return null;

    queueUri = 'https://' + account + '.queue.core.windows.net';
    var queueService = AzureStorage.Queue.createQueueServiceWithSas(queueUri, sas).withFilter(new AzureStorage.Queue.ExponentialRetryPolicyFilter());
    return queueService;
}

function refreshQueueList()
{
    var queueService = getQueueService();
    if (!queueService)
        return;

    document.getElementById('queues').innerHTML = 'Loading queue list...';
    queueService.listQueuesSegmented(null, {maxResults : 200}, function(error, results) {
        if (error) {
            alert('List queue list error, please open browser console to view detailed error');
            console.log(error);
        } else {
            var output = [];
            output.push('<tr>',
                            '<th>QueueName</th>',
                            '<th>Operations</th>',
                        '</tr>');

            if (results.entries.length < 1) {
                output.push('<tr><td>Empty results...</td></tr>');
            }

            for (var i = 0, queue; queue = results.entries[i]; i++) {
                output.push('<tr>',
                                '<td>', queue.name, '</td>',
                                '<td>', '<button class="btn btn-xs btn-danger" onclick="deleteQueue(\'', queue.name ,'\')">Delete</button> ',
                                        '<button class="btn btn-xs btn-success" onclick="viewQueue(\'', queue.name ,'\')">Select</button>', '</td>',
                            '</tr>');
            }
            document.getElementById('queues').innerHTML = '<table class="table table-condensed table-bordered">' + output.join('') + '</table>';
        }
    });
}

function createQueue() {
    var queueService = getQueueService();
    if (!queueService)
        return;

    var queue = document.getElementById('newqueue').value;
    if (!AzureStorage.Queue.Validate.queueNameIsValid(queue, function(err, res){})) {
        alert('Invalid queue name!');
        return;
    }
    queueService.createQueueIfNotExists(queue.toLowerCase(), function(error, result) {
        if (error) {
            alert('Create queue failed, open brower console for more detailed info.');
            console.log(error);
        } else {
            alert('Create ' + queue + ' successfully!');
            refreshQueueList();
        }
    });
}

function deleteQueue(queue) {
    var queueService = getQueueService();
    if (!queueService)
        return;

    queueService.deleteQueueIfExists(queue, function(error, result) {
        if (error) {
            alert('Delete queue failed, open brower console for more detailed info.');
            console.log(error);
        } else {
            alert('Delete ' + queue + ' successfully!');
            refreshQueueList();
        }
    });
}

function viewQueue(selectedQueue) {
    queue = selectedQueue;
    alert('Selected ' + queue + ' !');
    refreshMessageList();
}

function refreshMessageList() {
    var queueService = getQueueService();
    if (!queueService)
        return;
    
    if (queue == null || queue.length < 1) {
        alert('Please select a queue from queue list!')
        return;
    }

    document.getElementById('result').innerHTML = 'Loading queue messages...';
    queueService.peekMessages(queue, {numOfMessages: 32}, function (error, results) {
        if (error) {
            alert('List queue messages error, please open browser console to view detailed error');
            console.log(error);
        } else {
            var output = [];
            output.push('<tr>',
                            '<th>MessageId</th>',
                            '<th>MessageContent</th>',
                            '<th>DequeueCount</th>',
                            '<th>InsertionTime</th>',
                        '</tr>');
            if (results.length < 1) {
                output.push('<tr><td>Empty results...</td></tr>');
            }
            for (var i = 0, message; message = results[i]; i++) {
                output.push('<tr>',
                                '<td>', message.messageId, '</td>',
                                '<td>', encoder.decode(message.messageText), '</td>',
                                '<td>', message.dequeueCount, '</td>',
                                '<td>', message.insertionTime, '</td>',
                            '</tr>');
            }
            document.getElementById('result').innerHTML = '<table class="table table-condensed table-bordered">' + output.join('') + '</table>';
        }
    });
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
    queueService.createMessage(queue, encoder.encode(message), function(error, result, response) {
        if(error) {
            alert('Create messages error, please open browser console to view detailed error');
            console.log(error);
        } else {
            alert('Create message successfully!');
            refreshMessageList();
        }
    });
}
