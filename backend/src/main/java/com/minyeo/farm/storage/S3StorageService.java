package com.minyeo.farm.storage;

import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import java.io.IOException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3StorageService {

    private final S3Client s3Client;
    private final S3Properties s3Properties;

    public S3StorageService(S3Client s3Client, S3Properties s3Properties) {
        this.s3Client = s3Client;
        this.s3Properties = s3Properties;
    }

    /**
     * 상품 이미지 파일을 S3에 업로드하고 공개 URL을 반환한다.
     */
    public String uploadProductImage(MultipartFile file) {
        try {
            String key = "public/products/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(s3Properties.getBucket())
                    .key(key)
                    .contentType(file.getContentType())
                    .build();
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            String base = (s3Properties.getPublicUrl() != null && !s3Properties.getPublicUrl().isBlank())
                    ? s3Properties.getPublicUrl().replaceAll("/$", "")
                    : "https://" + s3Properties.getBucket() + ".s3." + s3Properties.getRegion() + ".amazonaws.com";
            return base + "/" + key;
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "S3 업로드 실패");
        }
    }
}
