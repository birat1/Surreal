package com.notificationservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.support.ListenerExecutionFailedException;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RabbitMqConfig {

    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String DL_EXCHANGE = "chat.dlx";

    public static final String CHAT_QUEUE = "chat.queue";
    public static final String CHAT_DLQUEUE = "chat.dlq.queue";

    public static final String CHAT_ROUTING_KEY = "notification.chat";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public TopicExchange dlExchange() {
        return new TopicExchange(DL_EXCHANGE);
    }

    @Bean
    public Queue chatQueue() {
        return QueueBuilder.durable(CHAT_QUEUE)
                .withArgument("x-dead-letter-exchange", DL_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", CHAT_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding chatBinding() {
        return BindingBuilder
                .bind(chatQueue())
                .to(notificationExchange())
                .with(CHAT_ROUTING_KEY);
    }

    @Bean
    public Queue chatDLQueue() {
        return QueueBuilder.durable(CHAT_DLQUEUE)
                .withArgument("x-message-ttl", 7 * 24 * 60 * 60 * 1000)
                .build();
    }

    @Bean
    public Binding chatDlQBinding() {
        return BindingBuilder
                .bind(chatDLQueue())
                .to(dlExchange())
                .with(CHAT_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jacksonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public ObjectMapper ObjectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setAcknowledgeMode(AcknowledgeMode.AUTO);
        factory.setDefaultRequeueRejected(false);
        factory.setErrorHandler(t -> {
            if (t instanceof ListenerExecutionFailedException e) {
                System.err.println("Message failed and routed to DLQ: " +
                        e.getFailedMessage().getBody());
                e.printStackTrace();
            } else {
                t.printStackTrace();
            }
        });
        return factory;
    }

}
