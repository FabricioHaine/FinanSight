package com.finansight.config;

import com.finansight.domain.Budget;
import com.finansight.domain.Category;
import com.finansight.domain.FinancialGoal;
import com.finansight.domain.FinancialTransaction;
import com.finansight.domain.GoalContribution;
import com.finansight.domain.User;
import com.finansight.domain.enums.CategoryType;
import com.finansight.domain.enums.GoalStatus;
import com.finansight.domain.enums.TransactionType;
import com.finansight.repository.BudgetRepository;
import com.finansight.repository.CategoryRepository;
import com.finansight.repository.FinancialGoalRepository;
import com.finansight.repository.GoalContributionRepository;
import com.finansight.repository.TransactionRepository;
import com.finansight.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Dados de DEMONSTRAÇÃO.
 *
 * <p>Separados dos dados reais: tudo pertence a uma única conta dedicada
 * ({@value #DEMO_EMAIL}) e só é criado quando {@code finansight.demo.enabled=true}.
 * Nenhum dado de demonstração é misturado com a conta de um usuário real.
 */
@Component
@ConditionalOnProperty(name = "finansight.demo.enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    public static final String DEMO_EMAIL = "demo@finansight.app";
    public static final String DEMO_PASSWORD = "demo1234";

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final FinancialGoalRepository goalRepository;
    private final GoalContributionRepository contributionRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            BudgetRepository budgetRepository,
            FinancialGoalRepository goalRepository,
            GoalContributionRepository contributionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.goalRepository = goalRepository;
        this.contributionRepository = contributionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmailIgnoreCase(DEMO_EMAIL)) {
            log.info("Dados de demonstração já existem. Nada a fazer.");
            return;
        }

        User user = new User();
        user.setName("Lucas");
        user.setEmail(DEMO_EMAIL);
        user.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        user.setCurrency("BRL");
        user.setMonthlyIncome(new BigDecimal("8500.00"));
        user.setSavingsGoal("Manter a reserva de emergência acima de R$ 12.000,00");
        userRepository.save(user);

        Category salario = category(user, "Salário", CategoryType.RECEITA, "Renda mensal principal");
        Category freelance = category(user, "Freelance", CategoryType.RECEITA, "Projetos pontuais");
        Category rendimentos = category(user, "Rendimentos", CategoryType.RECEITA, "Dividendos e juros");
        Category moradia = category(user, "Moradia", CategoryType.DESPESA, "Aluguel, contas e condomínio");
        Category alimentacao = category(user, "Alimentação", CategoryType.DESPESA, "Mercado, restaurantes e delivery");
        Category transporte = category(user, "Transporte", CategoryType.DESPESA, "Combustível, app e manutenção");
        Category lazer = category(user, "Lazer", CategoryType.DESPESA, "Cinema, viagens e assinaturas");
        Category saude = category(user, "Saúde", CategoryType.DESPESA, "Plano de saúde, academia e farmácia");
        Category educacao = category(user, "Educação", CategoryType.DESPESA, "Cursos e livros");

        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);

        // ----- Histórico de 6 meses -----
        for (int back = 5; back >= 0; back--) {
            YearMonth month = currentMonth.minusMonths(back);
            LocalDate first = month.atDay(1);
            int lastDay = month.lengthOfMonth();

            transaction(user, salario, "Salário mensal", "8500.00", TransactionType.RECEITA, first);
            if (back % 2 == 0) {
                transaction(
                        user,
                        freelance,
                        "Projeto freelance",
                        "1250.00",
                        TransactionType.RECEITA,
                        month.atDay(Math.min(12, lastDay)));
            }
            transaction(
                    user,
                    rendimentos,
                    "Rendimento da reserva",
                    "86.40",
                    TransactionType.RECEITA,
                    month.atDay(Math.min(5, lastDay)));

            transaction(user, moradia, "Aluguel", "1850.00", TransactionType.DESPESA, first);
            transaction(user, moradia, "Energia elétrica", "218.70", TransactionType.DESPESA, month.atDay(8));
            transaction(user, moradia, "Internet e celular", "149.90", TransactionType.DESPESA, month.atDay(9));
            transaction(user, alimentacao, "Mercado do mês", "980.35", TransactionType.DESPESA, month.atDay(6));
            transaction(user, alimentacao, "Restaurantes e delivery", "412.90", TransactionType.DESPESA, month.atDay(15));
            transaction(user, transporte, "Combustível", "340.00", TransactionType.DESPESA, month.atDay(11));
            transaction(user, transporte, "Aplicativo de corrida", "96.40", TransactionType.DESPESA, month.atDay(19));
            transaction(user, lazer, "Assinaturas de streaming", "74.90", TransactionType.DESPESA, month.atDay(3));
            transaction(user, lazer, "Cinema e bar", "95.00", TransactionType.DESPESA, month.atDay(21));
            transaction(user, saude, "Plano de saúde", "489.00", TransactionType.DESPESA, month.atDay(7));
            transaction(user, saude, "Academia", "119.90", TransactionType.DESPESA, month.atDay(7));
            transaction(user, educacao, "Curso online", "197.00", TransactionType.DESPESA, month.atDay(14));
        }

        // ----- Orçamentos do mês corrente -----
        budget(user, moradia, "2600.00", currentMonth);
        budget(user, alimentacao, "1500.00", currentMonth);
        budget(user, transporte, "600.00", currentMonth);
        budget(user, lazer, "400.00", currentMonth);

        // ----- Metas -----
        FinancialGoal reserva =
                goal(
                        user,
                        "Reserva de emergência",
                        "18000.00",
                        "Seis meses de custo de vida para emergências.",
                        currentMonth.minusMonths(8).atDay(1),
                        currentMonth.plusMonths(4).atEndOfMonth());
        contribution(user, reserva, "1500.00", currentMonth.minusMonths(7).atDay(5), "Aporte mensal inicial");
        contribution(user, reserva, "1500.00", currentMonth.minusMonths(6).atDay(5), "Aporte mensal");
        contribution(user, reserva, "1800.00", currentMonth.minusMonths(5).atDay(4), "Aporte com 13º salário");
        contribution(user, reserva, "1500.00", currentMonth.minusMonths(4).atDay(6), "Aporte mensal");
        contribution(user, reserva, "1500.00", currentMonth.minusMonths(3).atDay(3), "Aporte mensal");
        contribution(user, reserva, "2000.00", currentMonth.minusMonths(2).atDay(8), "Aporte mensal + extra");
        contribution(user, reserva, "1500.00", currentMonth.minusMonths(1).atDay(2), "Aporte mensal");
        contribution(user, reserva, "1500.00", currentMonth.atDay(2), "Aporte mensal");
        reserva.setAccumulatedAmount(new BigDecimal("11800.00"));
        reserva.setStatus(GoalStatus.ATIVA);
        goalRepository.save(reserva);

        FinancialGoal viagem =
                goal(
                        user,
                        "Viagem para o Sul",
                        "9000.00",
                        "Passagens e hospedagem para a temporada de verão.",
                        currentMonth.minusMonths(4).atDay(1),
                        currentMonth.plusMonths(6).atEndOfMonth());
        contribution(user, viagem, "1200.00", currentMonth.minusMonths(3).atDay(10), "Primeiro aporte");
        contribution(user, viagem, "1200.00", currentMonth.minusMonths(2).atDay(12), "Aporte mensal");
        contribution(user, viagem, "1200.00", currentMonth.minusMonths(1).atDay(9), "Aporte mensal");
        viagem.setAccumulatedAmount(new BigDecimal("3600.00"));
        viagem.setStatus(GoalStatus.ATIVA);
        goalRepository.save(viagem);

        FinancialGoal notebook =
                goal(
                        user,
                        "Notebook novo",
                        "6500.00",
                        "Upgrade para os estudos e para o trabalho.",
                        currentMonth.minusMonths(3).atDay(1),
                        currentMonth.plusMonths(3).atEndOfMonth());
        contribution(user, notebook, "2000.00", currentMonth.minusMonths(2).atDay(15), "Aporte único");
        contribution(user, notebook, "2000.00", currentMonth.minusMonths(1).atDay(15), "Aporte único");
        notebook.setAccumulatedAmount(new BigDecimal("4000.00"));
        notebook.setStatus(GoalStatus.ATIVA);
        goalRepository.save(notebook);

        log.info("Dados de demonstração criados para {}", DEMO_EMAIL);
    }

    private Category category(User user, String name, CategoryType type, String description) {
        Category category = new Category();
        category.setUser(user);
        category.setName(name);
        category.setType(type);
        category.setDescription(description);
        category.setActive(true);
        return categoryRepository.save(category);
    }

    private void transaction(
            User user,
            Category category,
            String description,
            String amount,
            TransactionType type,
            LocalDate date) {
        FinancialTransaction transaction = new FinancialTransaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setDescription(description);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setType(type);
        transaction.setDate(date);
        transactionRepository.save(transaction);
    }

    private void budget(User user, Category category, String limit, YearMonth period) {
        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setLimitAmount(new BigDecimal(limit));
        budget.setPeriod(period.atDay(1));
        budgetRepository.save(budget);
    }

    private FinancialGoal goal(
            User user,
            String name,
            String target,
            String description,
            LocalDate startDate,
            LocalDate deadline) {
        FinancialGoal goal = new FinancialGoal();
        goal.setUser(user);
        goal.setName(name);
        goal.setTargetAmount(new BigDecimal(target));
        goal.setAccumulatedAmount(BigDecimal.ZERO.setScale(2));
        goal.setDescription(description);
        goal.setStartDate(startDate);
        goal.setDeadline(deadline);
        goal.setStatus(GoalStatus.ATIVA);
        return goalRepository.save(goal);
    }

    private void contribution(
            User user, FinancialGoal goal, String amount, LocalDate date, String note) {
        GoalContribution contribution = new GoalContribution();
        contribution.setUser(user);
        contribution.setGoal(goal);
        contribution.setAmount(new BigDecimal(amount));
        contribution.setDate(date);
        contribution.setNote(note);
        contributionRepository.save(contribution);
    }
}
