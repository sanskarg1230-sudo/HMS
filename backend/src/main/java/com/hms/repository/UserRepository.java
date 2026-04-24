package com.hms.repository;

import com.hms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository layer for User entity.
 * Spring Data JPA automatically provides CRUD implementations.
 * findByEmail is a derived query that searches the users table by email.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    long countByRoomId(Long roomId);
    java.util.List<User> findByRoomId(Long roomId);
}
