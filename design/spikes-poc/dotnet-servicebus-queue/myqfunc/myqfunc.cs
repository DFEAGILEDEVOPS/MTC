using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;

namespace myqfunc
{
    public class myqfunc
    {
        [FunctionName("myqfunc")]
        public void Run([ServiceBusTrigger("myqueue", Connection = "sbcon")]string myQueueItem, ILogger log)
        {
            log.LogInformation($"C# ServiceBus queue trigger function processed message: {myQueueItem}");
        }
    }
}

