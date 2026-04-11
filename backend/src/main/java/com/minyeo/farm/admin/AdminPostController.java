package com.minyeo.farm.admin;

import com.minyeo.farm.admin.dto.AdminPostUpsertRequest;
import com.minyeo.farm.admin.dto.AdminPostResponse;
import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.post.Post;
import com.minyeo.farm.domain.post.PostRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/posts")
public class AdminPostController {

    private final PostRepository postRepository;

    public AdminPostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping
    public List<AdminPostResponse> list() {
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(AdminPostResponse::from)
                .toList();
    }

    @PostMapping
    public AdminPostResponse create(@Valid @RequestBody AdminPostUpsertRequest request) {
        Post post = postRepository.save(Post.builder()
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .published(request.isPublished())
                .build());
        return AdminPostResponse.from(post);
    }

    @PutMapping("/{id}")
    public AdminPostResponse update(@PathVariable Long id, @Valid @RequestBody AdminPostUpsertRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "게시글을 찾을 수 없습니다."));
        post.update(request.getCategory(), request.getTitle(), request.getContent(), request.isPublished());
        return AdminPostResponse.from(postRepository.save(post));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        postRepository.deleteById(id);
    }
}
