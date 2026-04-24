package com.hms.repository;

import com.hms.model.MessMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessMenuItemRepository extends JpaRepository<MessMenuItem, Long> {
    List<MessMenuItem> findByMenuId(Long menuId);
}
