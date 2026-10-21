package com.finansight.controller;

import com.finansight.dto.ReportResponse;
import com.finansight.service.ReportService;
import com.finansight.support.PeriodResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Relatórios", description = "Análise financeira por período e exportacao CSV")
public class ReportController {

    private final ReportService reportService;
    private final PeriodResolver periodResolver;

    public ReportController(ReportService reportService, PeriodResolver periodResolver) {
        this.reportService = reportService;
        this.periodResolver = periodResolver;
    }

    @GetMapping
    @Operation(summary = "Relatório analitico do período")
    public ReportResponse get(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long categoryId) {
        LocalDate[] period = periodResolver.resolve(from, to);
        return reportService.build(period[0], period[1], categoryId);
    }

    @GetMapping(value = "/export", produces = "text/csv")
    @Operation(summary = "Exporta as transações do período em CSV")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long categoryId) {
        LocalDate[] period = periodResolver.resolve(from, to);
        String csv = reportService.exportCsv(period[0], period[1], categoryId);
        byte[] body = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"finansight-transações.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(body);
    }
}
