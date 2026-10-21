package com.finansight.service;

import com.finansight.domain.FinancialGoal;
import com.finansight.domain.GoalContribution;
import com.finansight.domain.enums.GoalStatus;
import com.finansight.dto.ContributionRequest;
import com.finansight.dto.ContributionResponse;
import com.finansight.dto.GoalRequest;
import com.finansight.dto.GoalResponse;
import com.finansight.exception.BusinessRuleException;
import com.finansight.exception.ResourceNotFoundException;
import com.finansight.repository.FinancialGoalRepository;
import com.finansight.repository.GoalContributionRepository;
import com.finansight.security.CurrentUserProvider;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoalService {

    private final FinancialGoalRepository goalRepository;
    private final GoalContributionRepository contributionRepository;
    private final CurrentUserProvider currentUserProvider;

    public GoalService(
            FinancialGoalRepository goalRepository,
            GoalContributionRepository contributionRepository,
            CurrentUserProvider currentUserProvider) {
        this.goalRepository = goalRepository;
        this.contributionRepository = contributionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> list(GoalStatus status) {
        Long userId = currentUserProvider.getCurrentUserId();
        List<FinancialGoal> goals =
                status == null
                        ? goalRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                        : goalRepository.findAllByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        return goals.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public GoalResponse findById(Long id) {
        return toResponse(requireGoal(id));
    }

    @Transactional
    public GoalResponse create(GoalRequest request) {
        validateDates(request.startDate(), request.deadline());
        FinancialGoal goal = new FinancialGoal();
        goal.setUser(currentUserProvider.getCurrentUser());
        goal.setName(request.name().trim());
        goal.setTargetAmount(request.targetAmount().setScale(2, RoundingMode.HALF_UP));
        goal.setAccumulatedAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        goal.setStartDate(request.startDate());
        goal.setDeadline(request.deadline());
        goal.setDescription(request.description());
        goal.setStatus(GoalStatus.ATIVA);
        goalRepository.save(goal);
        return toResponse(goal);
    }

    @Transactional
    public GoalResponse update(Long id, GoalRequest request) {
        FinancialGoal goal = requireGoal(id);
        validateDates(request.startDate(), request.deadline());
        goal.setName(request.name().trim());
        goal.setTargetAmount(request.targetAmount().setScale(2, RoundingMode.HALF_UP));
        goal.setStartDate(request.startDate());
        goal.setDeadline(request.deadline());
        goal.setDescription(request.description());
        refreshStatus(goal);
        goalRepository.save(goal);
        return toResponse(goal);
    }

    @Transactional
    public void delete(Long id) {
        FinancialGoal goal = requireGoal(id);
        contributionRepository.deleteAll(contributionRepository.findAllByGoalIdAndUserIdOrderByDateDescIdDesc(goal.getId(), goal.getUser().getId()));
        goalRepository.delete(goal);
    }

    @Transactional
    public ContributionResponse addContribution(Long goalId, ContributionRequest request) {
        FinancialGoal goal = requireGoal(goalId);
        if (goal.getStatus() == GoalStatus.CANCELADA) {
            throw new BusinessRuleException("Não e possível contribuir para uma meta cancelada.");
        }
        GoalContribution contribution = new GoalContribution();
        contribution.setGoal(goal);
        contribution.setUser(currentUserProvider.getCurrentUser());
        contribution.setAmount(request.amount().setScale(2, RoundingMode.HALF_UP));
        contribution.setDate(request.date() == null ? LocalDate.now() : request.date());
        contribution.setNote(
                request.note() == null || request.note().isBlank() ? null : request.note().trim());
        contributionRepository.save(contribution);

        BigDecimal accumulated =
                contributionRepository.sumByGoalId(goalId).setScale(2, RoundingMode.HALF_UP);
        goal.setAccumulatedAmount(accumulated);
        refreshStatus(goal);
        goalRepository.save(goal);

        return new ContributionResponse(
                contribution.getId(),
                goal.getId(),
                goal.getName(),
                contribution.getAmount(),
                contribution.getDate(),
                contribution.getNote(),
                contribution.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<ContributionResponse> listContributions(Long goalId) {
        FinancialGoal goal = requireGoal(goalId);
        return contributionRepository
                .findAllByGoalIdAndUserIdOrderByDateDescIdDesc(goalId, goal.getUser().getId())
                .stream()
                .map(
                        contribution ->
                                new ContributionResponse(
                                        contribution.getId(),
                                        goal.getId(),
                                        goal.getName(),
                                        contribution.getAmount(),
                                        contribution.getDate(),
                                        contribution.getNote(),
                                        contribution.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void removeContribution(Long goalId, Long contributionId) {
        FinancialGoal goal = requireGoal(goalId);
        GoalContribution contribution =
                contributionRepository
                        .findAllByGoalIdAndUserIdOrderByDateDescIdDesc(goalId, goal.getUser().getId())
                        .stream()
                        .filter(item -> item.getId().equals(contributionId))
                        .findFirst()
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Contribuição não encontrada"));
        contributionRepository.delete(contribution);
        BigDecimal accumulated =
                contributionRepository.sumByGoalId(goalId).setScale(2, RoundingMode.HALF_UP);
        goal.setAccumulatedAmount(accumulated);
        refreshStatus(goal);
        goalRepository.save(goal);
    }

    private void refreshStatus(FinancialGoal goal) {
        if (goal.getStatus() == GoalStatus.CANCELADA) {
            return;
        }
        if (goal.getAccumulatedAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.CONCLUÍDA);
        } else if (goal.getStatus() != GoalStatus.CONCLUÍDA) {
            goal.setStatus(GoalStatus.ATIVA);
        }
    }

    private void validateDates(LocalDate startDate, LocalDate deadline) {
        if (startDate != null && deadline != null && deadline.isBefore(startDate)) {
            throw new BusinessRuleException("O prazo deve ser posterior à data de início.");
        }
    }

    private FinancialGoal requireGoal(Long id) {
        Long userId = currentUserProvider.getCurrentUserId();
        return goalRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));
    }

    private GoalResponse toResponse(FinancialGoal goal) {
        BigDecimal target = goal.getTargetAmount();
        BigDecimal accumulated = goal.getAccumulatedAmount();
        BigDecimal remaining = target.subtract(accumulated).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal percent =
                target.compareTo(BigDecimal.ZERO) <= 0
                        ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                        : accumulated.multiply(BigDecimal.valueOf(100)).divide(target, 2, RoundingMode.HALF_UP);
        boolean overdue =
                goal.getStatus() == GoalStatus.ATIVA
                        && goal.getDeadline() != null
                        && goal.getDeadline().isBefore(LocalDate.now());

        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                target,
                accumulated,
                remaining,
                percent,
                goal.getStatus(),
                overdue,
                goal.getStartDate(),
                goal.getDeadline(),
                goal.getDescription(),
                goal.getCreatedAt());
    }
}
