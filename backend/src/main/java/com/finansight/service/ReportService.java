package com.finansight.service;

import com.finansight.dto.ReportResponse;
import com.finansight.dto.TransactionResponse;
import com.finansight.security.CurrentUserProvider;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private static final DateTimeFormatter CSV_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final AnalyticsService analyticsService;
    private final TransactionService transactionService;
    private final CurrentUserProvider currentUserProvider;

    public ReportService(
            AnalyticsService analyticsService,
            TransactionService transactionService,
            CurrentUserProvider currentUserProvider) {
        this.analyticsService = analyticsService;
        this.transactionService = transactionService;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public ReportResponse build(LocalDate from, LocalDate to, Long categoryId) {
        Long userId = currentUserProvider.getCurrentUserId();
        var evolution = analyticsService.monthlyCashflow(userId, from, to, categoryId);
        BigDecimal averageExpenses = average(evolution, true);
        BigDecimal averageRevenues = average(evolution, false);

        return new ReportResponse(
                analyticsService.summary(userId, from, to, categoryId),
                analyticsService.comparison(userId, from, to, categoryId),
                evolution,
                analyticsService.categoryDistribution(userId, from, to, categoryId),
                averageExpenses,
                averageRevenues,
                from,
                to);
    }

    /** Exportacao CSV das transações do período, respeitando o filtro de categoria. */
    @Transactional(readOnly = true)
    public String exportCsv(LocalDate from, LocalDate to, Long categoryId) {
        List<TransactionResponse> transactions =
                transactionService.listAll(null, null, categoryId, from, to, "date", "asc");

        StringBuilder csv = new StringBuilder();
        csv.append("Data;Descrição;Categoria;Tipo;Valor;Observações\n");
        for (TransactionResponse transaction : transactions) {
            csv.append(escape(transaction.date().format(CSV_DATE)))
                    .append(';')
                    .append(escape(transaction.description()))
                    .append(';')
                    .append(escape(transaction.categoryName()))
                    .append(';')
                    .append(transaction.type() == com.finansight.domain.enums.TransactionType.RECEITA ? "Receita" : "Despesa")
                    .append(';')
                    .append(format(transaction.amount()))
                    .append(';')
                    .append(escape(transaction.notes() == null ? "" : transaction.notes()))
                    .append('\n');
        }
        return csv.toString();
    }

    private BigDecimal average(List<com.finansight.dto.CashflowPoint> points, boolean expenses) {
        if (points.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal total =
                points.stream()
                        .map(point -> expenses ? point.expenses() : point.revenues())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(points.size()), 2, RoundingMode.HALF_UP);
    }

    private String format(BigDecimal value) {
        return new java.text.DecimalFormat("#,##0.00", new java.text.DecimalFormatSymbols(new Locale("pt", "BR")))
                .format(value);
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return "\"" + value.replace("\"", "'").replace("\n", " ").replace("\r", " ") + "\"";
    }
}
