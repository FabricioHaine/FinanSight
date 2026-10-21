package com.finansight.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.finansight.domain.Category;
import com.finansight.domain.User;
import com.finansight.domain.enums.CategoryType;
import com.finansight.domain.enums.TransactionType;
import com.finansight.dto.TransactionRequest;
import com.finansight.exception.BusinessRuleException;
import com.finansight.repository.CategoryRepository;
import com.finansight.repository.TransactionRepository;
import com.finansight.security.CurrentUserProvider;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    private TransactionService transactionService;
    private User user;
    private Category despesaCategory;
    private Category receitaCategory;

    @BeforeEach
    void setUp() {
        transactionService =
                new TransactionService(transactionRepository, categoryRepository, currentUserProvider);

        user = new User();
        user.setId(1L);
        user.setName("Lucas");
        user.setEmail("lucas@finansight.app");

        despesaCategory = new Category();
        despesaCategory.setId(10L);
        despesaCategory.setUser(user);
        despesaCategory.setName("Alimentação");
        despesaCategory.setType(CategoryType.DESPESA);
        despesaCategory.setActive(true);

        receitaCategory = new Category();
        receitaCategory.setId(11L);
        receitaCategory.setUser(user);
        receitaCategory.setName("Salário");
        receitaCategory.setType(CategoryType.RECEITA);
        receitaCategory.setActive(true);

        when(currentUserProvider.getCurrentUser()).thenReturn(user);
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
    }

    @Test
    @DisplayName("Impede usar uma categoria de despesa em uma receita")
    void shouldRejectMismatchedCategoryType() {
        when(categoryRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(despesaCategory));

        TransactionRequest request =
                new TransactionRequest(
                        "Bonus",
                        new BigDecimal("500.00"),
                        TransactionType.RECEITA,
                        10L,
                        LocalDate.of(2026, 3, 10),
                        null);

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Alimentação");
    }

    @Test
    @DisplayName("Impede registrar em categoria inativa")
    void shouldRejectInactiveCategory() {
        despesaCategory.setActive(false);
        when(categoryRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(despesaCategory));

        TransactionRequest request =
                new TransactionRequest(
                        "Mercado",
                        new BigDecimal("120.00"),
                        TransactionType.DESPESA,
                        10L,
                        LocalDate.of(2026, 3, 10),
                        null);

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("inativa");
    }

    @Test
    @DisplayName("Cria a transação com o valor normalizado para duas casas decimais")
    void shouldCreateTransaction() {
        when(categoryRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(despesaCategory));
        when(transactionRepository.save(any()))
                .thenAnswer(
                        invocation -> {
                            com.finansight.domain.FinancialTransaction transaction =
                                    invocation.getArgument(0);
                            transaction.setId(99L);
                            return transaction;
                        });

        TransactionRequest request =
                new TransactionRequest(
                        "Mercado",
                        new BigDecimal("120.5"),
                        TransactionType.DESPESA,
                        10L,
                        LocalDate.of(2026, 3, 10),
                        "  compra da semana  ");

        var response = transactionService.create(request);

        assertThat(response.id()).isEqualTo(99L);
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("120.50"));
        assertThat(response.notes()).isEqualTo("compra da semana");
        assertThat(response.categoryName()).isEqualTo("Alimentação");
    }

    @Test
    @DisplayName("Não encontra transação de outro usuário")
    void shouldNotFindForeignTransaction() {
        when(transactionRepository.findByIdAndUserId(500L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.findById(500L))
                .isInstanceOf(com.finansight.exception.ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Calcula a variacao percentual entre períodos")
    void shouldCalculateVariation() {
        assertThat(TransactionService.variation(new BigDecimal("120.00"), new BigDecimal("100.00")))
                .isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(TransactionService.variation(new BigDecimal("80.00"), new BigDecimal("100.00")))
                .isEqualByComparingTo(new BigDecimal("-20.00"));
        assertThat(TransactionService.variation(new BigDecimal("80.00"), BigDecimal.ZERO)).isNull();
    }
}
