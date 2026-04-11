package com.minyeo.farm.domain.user;

import com.minyeo.farm.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProvider provider;

    @Column(name = "provider_user_id", nullable = false, unique = true, length = 120)
    private String providerUserId;

    @Column(length = 120)
    private String email;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 30)
    private String phone;

    @Builder
    public User(UserRole role, AuthProvider provider, String providerUserId, String email, String name, String phone) {
        this.role = role;
        this.provider = provider;
        this.providerUserId = providerUserId;
        this.email = email;
        this.name = name;
        this.phone = phone;
    }

    public void updateProfile(String email, String name, String phone) {
        this.email = email;
        this.name = name;
        this.phone = phone;
    }

    public void promoteToAdmin() {
        this.role = UserRole.ADMIN;
    }
}
