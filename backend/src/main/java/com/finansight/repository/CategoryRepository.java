package com.finansight.repository;

import com.finansight.domain.Category;
import com.finansight.domain.enums.CategoryType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByUserIdOrderByNameAsc(Long userId);

    List<Category> findAllByUserIdAndActiveTrueOrderByNameAsc(Long userId);

    List<Category> findAllByUserIdAndTypeOrderByNameAsc(Long userId, CategoryType type);

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);

    long countByUserIdAndType(Long userId, CategoryType type);
}
