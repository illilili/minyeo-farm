package com.minyeo.farm.domain.post;

import com.minyeo.farm.common.entity.BaseTimeEntity;
import com.minyeo.farm.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "posts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostCategory category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_published", nullable = false)
    private boolean published;

    @Column(name = "view_count", nullable = false)
    private Long viewCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Builder
    public Post(PostCategory category, String title, String content, boolean published, User createdBy) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.published = published;
        this.createdBy = createdBy;
        this.viewCount = 0L;
    }

    public void update(PostCategory category, String title, String content, boolean published) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.published = published;
    }

    public void increaseViewCount() {
        this.viewCount += 1;
    }
}
