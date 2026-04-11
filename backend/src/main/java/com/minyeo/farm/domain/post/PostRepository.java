package com.minyeo.farm.domain.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCategoryAndPublishedTrue(PostCategory category, Pageable pageable);

    Page<Post> findByPublishedTrue(Pageable pageable);
}
