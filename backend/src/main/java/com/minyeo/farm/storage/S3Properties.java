package com.minyeo.farm.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.s3")
public class S3Properties {
    private String region;
    private String bucket;
    private String accessKey;
    private String secretKey;
    /** R2 등 S3 호환 스토리지 엔드포인트. 비워두면 AWS 기본값 사용. */
    private String endpoint;
    /** 업로드된 파일의 공개 베이스 URL. 비워두면 AWS S3 URL 자동 구성. */
    private String publicUrl;
}
