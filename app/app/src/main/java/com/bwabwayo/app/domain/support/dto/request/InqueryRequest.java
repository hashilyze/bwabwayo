package com.bwabwayo.app.domain.support.dto.request;

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
public class InqueryRequest {

    private String title;
    private String description;
    private List<String> imageUrlList;

    public static Inquery toEntity(InqueryRequest request){
        return Inquery.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrlList(request.getImageUrlList())
                .build();
    }
}
