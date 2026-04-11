package com.minyeo.farm.admin;

import com.minyeo.farm.storage.S3StorageService;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
public class AdminMediaController {

    private final S3StorageService s3StorageService;

    public AdminMediaController(S3StorageService s3StorageService) {
        this.s3StorageService = s3StorageService;
    }

    @PostMapping("/upload")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        String url = s3StorageService.uploadProductImage(file);
        return Map.of("url", url);
    }
}
