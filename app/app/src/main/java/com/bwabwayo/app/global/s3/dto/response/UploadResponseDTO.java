package com.bwabwayo.app.global.s3.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadResponseDTO {
    private List<UploadResultDTO> result;
}
