package com.finansight.controller;

import com.finansight.dto.DashboardResponse;
import com.finansight.service.DashboardService;
import com.finansight.support.PeriodResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Indicadores consolidados do usuário")
public class DashboardController {

    private final DashboardService dashboardService;
    private final PeriodResolver periodResolver;

    public DashboardController(DashboardService dashboardService, PeriodResolver periodResolver) {
        this.dashboardService = dashboardService;
        this.periodResolver = periodResolver;
    }

    @GetMapping
    @Operation(summary = "Retorna o dashboard financeiro do período")
    public DashboardResponse get(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate[] period = periodResolver.resolve(from, to);
        return dashboardService.build(period[0], period[1]);
    }
}
