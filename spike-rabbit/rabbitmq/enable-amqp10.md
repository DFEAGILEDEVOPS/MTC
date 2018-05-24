# Enabling AMQP 1.0 in Rabbit MQ

In order to use the npm package `amqp10` with Rabbit MQ the `rabbitmq_amqp1_0` plugin must be enabled within Rabbit MQ.

There have been difficulties getting this plugin enabled via docker compose as [described here](https://github.com/docker-library/rabbitmq/issues/260)

The current workaround is to attach terminal to the running RabbitMQ container and manually execute the enable plugin command, as follows:

`docker exec -i -t ef0  /bin/bash` 

(where `ef0` is the first 3 digits of the hash of the running Rabbit MQ container)

Once connected, run the following:

`rabbitmq-plugins enable rabbitmq_amqp1_0`

The output should be similar to...

```
The following plugins have been configured:
  rabbitmq_amqp1_0
Applying plugin configuration to rabbit@ef093666a397...
The following plugins have been enabled:
  rabbitmq_amqp1_0

started 1 plugins.
```
