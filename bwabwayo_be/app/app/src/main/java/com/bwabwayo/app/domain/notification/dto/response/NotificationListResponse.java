package com.bwabwayo.app.domain.notification.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationListResponse {
    Long totalUnread;

    Integer size;

    @Builder.Default
    List<NotificationResponse> results = new ArrayList<>();

    public static NotificationListResponse of(List<NotificationResponse> notificationDTOs, Long totalUnread) {
        return NotificationListResponse.builder()
                .totalUnread(totalUnread)
                .size(notificationDTOs.size())
                .results(notificationDTOs)
                .build();
    }
}
