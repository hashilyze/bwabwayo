package com.bwabwayo.app.domain.support.dto.response;

import com.bwabwayo.app.domain.support.domain.Inquery;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InqueryResponse {
    private Long id;
    private String title;
    private List<String> imageUrlList;
    private String name;
    private String description;
    private String reply;
    private String createdAt;
    private String repliedAt;
}
