package com.bwabwayo.app.domain.chat.domain;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Component
public class RedisMessageSubscriber implements MessageListener {

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String msg = new String(message.getBody());
        System.out.println("📨 Received from Redis: " + msg);
        // 여기서 웹소켓으로 클라이언트에 메시지 push하거나 처리 로직 연결
    }
}
