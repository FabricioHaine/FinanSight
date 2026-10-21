package com.finansight.service;

import com.finansight.domain.Category;
import com.finansight.domain.FinancialTransaction;
import com.finansight.domain.enums.TransactionType;
import com.finansight.dto.PageResponse;
import com.finansight.dto.TransactionRequest;
import com.finansight.dto.TransactionResponse;
import com.finansight.exception.BusinessRuleException;
import com.finansight.exception.ResourceNotFoundException;
import com.finansight.repository.CategoryRepository;
import com.finansight.repository.TransactionRepository;
import com.finansight.security.CurrentUserProvider;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private static final java.util.Map<String, String> SORTABLE_FIELDS =
            java.util.Map.of(
                    "date", "date",
                    "amount", "amount",
                    "description", "description",
                    "type", "type",
                    "category", "category.name",
                    "createdAt", "createdAt");

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CurrentUserProvider currentUserProvider;

    public TransactionService(
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository,
            CurrentUserProvider currentUserProvider) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> search(
            String search,
            TransactionType type,
            Long categoryId,
            LocalDate from,
            LocalDate to,
            String sortBy,
            String direction,
            int page,
            int size) {

        Long userId = currentUserProvider.getCurrentUserId();
        Specification<FinancialTransaction> spec = buildSpecification(userId, search, type, categoryId, from, to);

        Sort sort = buildSort(sortBy, direction);
        Page<FinancialTransaction> result =
                transactionRepository.findAll(spec, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort));

        return PageResponse.of(result.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(Long id) {
        return toResponse(requireTransaction(id));
    }

    /** Lista completa (sem paginacao) usada na exportacao CSV. */
    @Transactional(readOnly = true)
    public List<TransactionResponse> listAll(
            String search,
            TransactionType type,
            Long categoryId,
            LocalDate from,
            LocalDate to,
            String sortBy,
            String direction) {
        Long userId = currentUserProvider.getCurrentUserId();
        Specification<FinancialTransaction> spec =
                buildSpecification(userId, search, type, categoryId, from, to);
        return transactionRepository.findAll(spec, buildSort(sortBy, direction)).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        Category category = requireCategory(request.categoryId(), userId);
        validateCategoryType(category, request.type());

        FinancialTransaction transaction = new FinancialTransaction();
        transaction.setUser(currentUserProvider.getCurrentUser());
        transaction.setCategory(category);
        applyFields(transaction, request);
        transactionRepository.save(transaction);
        return toResponse(transaction);
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionRequest request) {
        FinancialTransaction transaction = requireTransaction(id);
        Long userId = currentUserProvider.getCurrentUserId();
        Category category = requireCategory(request.categoryId(), userId);
        validateCategoryType(category, request.type());

        transaction.setCategory(category);
        applyFields(transaction, request);
        transactionRepository.save(transaction);
        return toResponse(transaction);
    }

    @Transactional
    public void delete(Long id) {
        FinancialTransaction transaction = requireTransaction(id);
        transactionRepository.delete(transaction);
    }

    private void applyFields(FinancialTransaction transaction, TransactionRequest request) {
        transaction.setDescription(request.description().trim());
        transaction.setAmount(request.amount().setScale(2, java.math.RoundingMode.HALF_UP));
        transaction.setType(request.type());
        transaction.setDate(request.date());
        transaction.setNotes(
                request.notes() == null || request.notes().isBlank() ? null : request.notes().trim());
    }

    private void validateCategoryType(Category category, TransactionType type) {
        if (category.getType().name() != type.name()) {
            throw new BusinessRuleException(
                    "A categoria \""
                            + category.getName()
                            + "\" é do tipo "
                            + category.getType()
                            + " e não aceita transações do tipo "
                            + type
                            + ".");
        }
        if (!category.isActive()) {
            throw new BusinessRuleException("A categoria \"" + category.getName() + "\" está inativa.");
        }
    }

    private Category requireCategory(Long categoryId, Long userId) {
        return categoryRepository
                .findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }

    private FinancialTransaction requireTransaction(Long id) {
        Long userId = currentUserProvider.getCurrentUserId();
        return transactionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
    }

    private Specification<FinancialTransaction> buildSpecification(
            Long userId, String search, TransactionType type, Long categoryId, LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), to));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("description")), pattern),
                                cb.like(cb.lower(cb.coalesce(root.get("notes"), "")), pattern)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(String sortBy, String direction) {
        String field = SORTABLE_FIELDS.getOrDefault(sortBy == null ? "date" : sortBy, "date");
        Sort.Direction dir =
                "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, field);
    }

    private TransactionResponse toResponse(FinancialTransaction transaction) {
        return toStaticResponse(transaction);
    }

    /** Conversao reutilizada pelos servicos de análise. */
    public static TransactionResponse toStaticResponse(FinancialTransaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getCategory().getId(),
                transaction.getCategory().getName(),
                transaction.getDate(),
                transaction.getNotes(),
                transaction.getCreatedAt());
    }

    /** Utilitario compartilhado para o calculo de variacoes percentuais. */
    public static BigDecimal variation(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous.abs(), 2, java.math.RoundingMode.HALF_UP);
    }
}
