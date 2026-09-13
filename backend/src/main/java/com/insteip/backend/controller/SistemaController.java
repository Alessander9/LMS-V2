package com.insteip.backend.controller;

import com.insteip.backend.infrastructure.scheduler.BackupScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sistema")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class SistemaController {

    private final DataSource dataSource;
    private final BackupScheduler backupScheduler;

    @PostMapping("/backup")
    public ResponseEntity<Map<String, String>> triggerBackup() {
        Map<String, String> response = new HashMap<>();
        try {
            String timestamp = backupScheduler.runBackup();
            response.put("status", "SUCCESS");
            response.put("timestamp", timestamp);
            response.put("mensaje", "Backup generado exitosamente.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("mensaje", "Error al generar backup: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();

        // 1. Estado Backend
        status.put("backendStatus", "ACTIVO");

        // 2. Estado Base de Datos
        String dbStatus = "DESCONECTADO";
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            dbStatus = "CONECTADO";
        } catch (Exception e) {
            dbStatus = "ERROR: " + e.getMessage();
        }
        status.put("databaseStatus", dbStatus);

        // 3. Espacio Disco
        File root = new File(".");
        long totalSpace = root.getTotalSpace();
        long freeSpace = root.getFreeSpace();
        long usedSpace = totalSpace - freeSpace;
        status.put("discoTotalGb", String.format("%.2f GB", (double) totalSpace / (1024 * 1024 * 1024)));
        status.put("discoUsadoGb", String.format("%.2f GB", (double) usedSpace / (1024 * 1024 * 1024)));
        status.put("discoLibreGb", String.format("%.2f GB", (double) freeSpace / (1024 * 1024 * 1024)));
        status.put("discoPorcentajeUsado", totalSpace > 0 ? (double) usedSpace * 100 / totalSpace : 0.0);

        // 4. Último Backup
        File backupDir = new File("uploads/backups");
        String ultimoBackup = "Ninguno programado";
        if (backupDir.exists() && backupDir.isDirectory()) {
            File[] files = backupDir.listFiles();
            if (files != null && files.length > 0) {
                File latest = null;
                for (File f : files) {
                    if (latest == null || f.lastModified() > latest.lastModified()) {
                        latest = f;
                    }
                }
                if (latest != null) {
                    LocalDateTime creationTime = LocalDateTime.ofInstant(
                            java.time.Instant.ofEpochMilli(latest.lastModified()),
                            java.time.ZoneId.systemDefault()
                    );
                    ultimoBackup = creationTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
                }
            }
        }
        status.put("ultimoBackup", ultimoBackup);

        // 5. Memoria JVM
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long allocatedMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long jvmUsedMemory = allocatedMemory - freeMemory;
        status.put("jvmMaxMb", maxMemory / (1024 * 1024));
        status.put("jvmAllocatedMb", allocatedMemory / (1024 * 1024));
        status.put("jvmUsedMb", jvmUsedMemory / (1024 * 1024));
        status.put("jvmFreeMb", freeMemory / (1024 * 1024));
        status.put("jvmPorcentajeUsado", allocatedMemory > 0 ? (double) jvmUsedMemory * 100 / allocatedMemory : 0.0);

        // 6. CPU
        double cpuLoad = 0.0;
        try {
            java.lang.management.OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                cpuLoad = ((com.sun.management.OperatingSystemMXBean) osBean).getCpuLoad() * 100;
            }
        } catch (Exception e) {
            cpuLoad = -1.0;
        }
        status.put("cpuLoad", String.format("%.2f%%", cpuLoad));

        return ResponseEntity.ok(status);
    }
}
