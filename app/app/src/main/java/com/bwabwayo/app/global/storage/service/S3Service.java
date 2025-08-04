package com.bwabwayo.app.global.storage.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service implements StorageService {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Override
    public String upload(MultipartFile file, String dir) {
        String originalFilename = file.getOriginalFilename();
        String key = dir + "/" + UUID.randomUUID() + "_" + originalFilename;

        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            amazonS3.putObject(new PutObjectRequest(bucketName, key, file.getInputStream(), metadata));

            return key;
        } catch (IOException e) {
            throw new RuntimeException("S3 업로드 실패", e);
        }
    }

    @Override
    public String upload(String srcURL, String dir) {
        try {
            // URL 로부터 InputStream
            URL url = new URL(srcURL);
            URLConnection connection = url.openConnection();
            connection.setConnectTimeout(5000); // 5초 연결 타임아웃
            connection.setReadTimeout(5000);    // 5초 읽기 타임아웃

            String contentType = connection.getContentType(); // image/jpeg
            long contentLength = connection.getContentLengthLong();

            String extension = contentType.substring(contentType.lastIndexOf("/") + 1);
            String key = dir + "/" + UUID.randomUUID() + "." + extension;

            // InputStream 으로 S3 업로드
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(contentType);
            metadata.setContentLength(contentLength);


            try (InputStream inputStream = connection.getInputStream()) {
                PutObjectRequest putRequest = new PutObjectRequest(bucketName, key, inputStream, metadata);
                amazonS3.putObject(putRequest);
            }

            return key;
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    @Override
    public void delete(String key) {
        amazonS3.deleteObject(bucketName, key);
    }

    @Override
    public void copy(String sourceKey, String targetKey) {
        if(!exists(sourceKey)){
            throw new IllegalArgumentException("Source key가 존재하지 않습니다: sourceKey=" + sourceKey);
        }
        amazonS3.copyObject(bucketName, sourceKey, bucketName, targetKey);
    }

    @Override
    public void move(String sourceKey, String targetKey) {
        if(!exists(sourceKey)){
            throw new IllegalArgumentException("Source key가 존재하지 않습니다: sourceKey=" + sourceKey);
        }
        amazonS3.copyObject(bucketName, sourceKey, bucketName, targetKey);
        amazonS3.deleteObject(bucketName, sourceKey);
    }

    @Override
    public String generatePresignedUrl(String key, long expiration) {
        Date expirationDate = new Date(System.currentTimeMillis() + expiration);

        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, key)
                        .withMethod(HttpMethod.GET)
                        .withExpiration(expirationDate);

        URL url = amazonS3.generatePresignedUrl(generatePresignedUrlRequest);
        return url.toString();
    }

    @Override
    public boolean exists(String key) {
        return amazonS3.doesObjectExist(bucketName, key);
    }

    @Override
    public String getUrlFromKey(String key) {
        return amazonS3.getUrl(bucketName, key).toString();
    }
}
