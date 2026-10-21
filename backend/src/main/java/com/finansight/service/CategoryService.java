package com.finansight.service;

import com.finansight.domain.Category;
import com.finansight.dto.CategoryRequest;
import com.finansight.dto.CategoryResponse;
import com.finansight.exception.BusinessRuleException;
import com.finansight.exception.ResourceNotFoundException;
import com.finansight.repository.CategoryRepository;
import com.finansight.repository.TransactionRepository;
import com.finansight.security.CurrentUserProvider;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserProvider currentUserProvider;

    public CategoryService(
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            CurrentUserProvider currentUserProvider) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list(boolean onlyActive) {
        Long userId = currentUserProvider.getCurrentUserId();
        List<Category> categories =
                onlyActive
                        ? categoryRepository.findAllByUserIdAndActiveTrueOrderByNameAsc(userId)
                        : categoryRepository.findAllByUserIdOrderByNameAsc(userId);
        return categories.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return toResponse(requireCategory(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, request.name().trim())) {
            throw new BusinessRuleException("Já existe uma categoria com este nome");
        }
        Category category = new Category();
        category.setUser(currentUserProvider.getCurrentUser());
        category.setName(request.name().trim());
        category.setType(request.type());
        category.setDescription(request.description());
        category.setActive(request.active() == null || request.active());
        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = requireCategory(id);
        Long userId = currentUserProvider.getCurrentUserId();
        if (!category.getName().equalsIgnoreCase(request.name().trim())
                && categoryRepository.existsByUserIdAndNameIgnoreCase(userId, request.name().trim())) {
            throw new BusinessRuleException("Já existe uma categoria com este nome");
        }
        category.setName(request.name().trim());
        category.setDescription(request.description());
        if (request.active() != null) {
            category.setActive(request.active());
        }
        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = requireCategory(id);
        long usage = transactionRepository.countByCategoryIdAndUserId(category.getId(), category.getUser().getId());
        if (usage > 0) {
            throw new BusinessRuleException(
                    "Esta categoria possui "
                            + usage
                            + " transação(ões) vinculada(s). Desative-a em vez de excluir.");
        }
        categoryRepository.delete(category);
    }

    private Category requireCategory(Long id) {
        Long userId = currentUserProvider.getCurrentUserId();
        return categoryRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }

    private CategoryResponse toResponse(Category category) {
        long count =
                transactionRepository.countByCategoryIdAndUserId(category.getId(), category.getUser().getId());
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getDescription(),
                category.isActive(),
                count);
    }
}
