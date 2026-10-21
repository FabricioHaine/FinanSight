package com.finansight.controller;

import com.finansight.domain.enums.GoalStatus;
import com.finansight.dto.ContributionRequest;
import com.finansight.dto.ContributionResponse;
import com.finansight.dto.GoalRequest;
import com.finansight.dto.GoalResponse;
import com.finansight.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
@Tag(name = "Metas financeiras", description = "Metas de economia e suas contribuições")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    @Operation(summary = "Lista as metas do usuário")
    public List<GoalResponse> list(@RequestParam(required = false) GoalStatus status) {
        return goalService.list(status);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalha uma meta")
    public GoalResponse findById(@PathVariable Long id) {
        return goalService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria uma meta financeira")
    public GoalResponse create(@Valid @RequestBody GoalRequest request) {
        return goalService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma meta financeira")
    public GoalResponse update(@PathVariable Long id, @Valid @RequestBody GoalRequest request) {
        return goalService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Exclui uma meta e suas contribuições")
    public void delete(@PathVariable Long id) {
        goalService.delete(id);
    }

    @GetMapping("/{id}/contributions")
    @Operation(summary = "Lista as contribuições de uma meta")
    public List<ContributionResponse> listContributions(@PathVariable Long id) {
        return goalService.listContributions(id);
    }

    @PostMapping("/{id}/contributions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registra uma contribuição na meta")
    public ContributionResponse addContribution(
            @PathVariable Long id, @Valid @RequestBody ContributionRequest request) {
        return goalService.addContribution(id, request);
    }

    @DeleteMapping("/{id}/contributions/{contributionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove uma contribuição da meta")
    public void removeContribution(@PathVariable Long id, @PathVariable Long contributionId) {
        goalService.removeContribution(id, contributionId);
    }
}
