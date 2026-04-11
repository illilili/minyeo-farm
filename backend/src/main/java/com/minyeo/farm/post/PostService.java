package com.minyeo.farm.post;

import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.post.Post;
import com.minyeo.farm.domain.post.PostCategory;
import com.minyeo.farm.domain.post.PostRepository;
import com.minyeo.farm.post.dto.PostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPosts(PostCategory category, Pageable pageable) {
        if (category == null) {
            return postRepository.findByPublishedTrue(pageable).map(PostResponse::from);
        }
        return postRepository.findByCategoryAndPublishedTrue(category, pageable).map(PostResponse::from);
    }

    @Transactional
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "소식을 찾을 수 없습니다."));
        if (!post.isPublished()) {
            throw new AppException(ErrorCode.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }
        post.increaseViewCount();
        return PostResponse.from(post);
    }
}
