package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.entity.Pago;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.repository.PagoRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pagos")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository pagoRepository;

    private final UsuarioRepository usuarioRepository;

    private final AuditoriaService auditoriaService;

    @GetMapping("/pendientes")
    public ResponseEntity<List<Map<String, Object>>> obtenerPagosPendientes() {
        List<Pago> pendientes = pagoRepository.findByAprobadoFalse();
        List<Map<String, Object>> response = pendientes.stream().map(pago -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", pago.getId());
            map.put("monto", pago.getMonto());
            map.put("metodoPago", pago.getMetodoPago());
            map.put("numeroOperacion", pago.getNumeroOperacion());
            map.put("observaciones", pago.getObservaciones());
            map.put("fechaPago", pago.getFechaPago());
            
            // Usuario info
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", pago.getUsuario().getId());
            userMap.put("nombres", pago.getUsuario().getNombres());
            userMap.put("apellidos", pago.getUsuario().getApellidos());
            userMap.put("correo", pago.getUsuario().getCorreo());
            map.put("usuario", userMap);

            // Nivel suscripcion info
            Map<String, Object> subMap = new HashMap<>();
            subMap.put("id", pago.getNivelSuscripcion().getId());
            subMap.put("nombre", pago.getNivelSuscripcion().getNombre());
            map.put("nivelSuscripcion", subMap);

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarPago(Authentication authentication, @PathVariable Long id) {
        Pago pago = pagoRepository.findById(id).orElse(null);
        Map<String, String> response = new HashMap<>();
        if (pago == null) {
            response.put("error", "Pago no encontrado");
            return ResponseEntity.status(404).body(response);
        }

        if (pago.getAprobado()) {
            response.put("mensaje", "El pago ya está aprobado");
            return ResponseEntity.ok(response);
        }

        // Obtener el admin autenticado
        Usuario admin = null;
        if (authentication != null) {
            admin = usuarioRepository.findByCorreo(authentication.getName()).orElse(null);
        }

        // Marcar pago como aprobado
        pago.setAprobado(true);
        pago.setFechaAprobacion(LocalDateTime.now());
        pago.setAprobadoPor(admin);
        pagoRepository.save(pago);

        // Actualizar nivel de suscripción del usuario
        Usuario usuario = pago.getUsuario();
        usuario.setNivelSuscripcion(pago.getNivelSuscripcion());
        usuarioRepository.save(usuario);

        // Registrar auditoría
        auditoriaService.registrarEvento("PAGOS", "APROBAR", 
                "Aprobado pago ID: " + pago.getId() + " para el usuario ID: " + usuario.getId() + 
                " asignándole nivel: " + pago.getNivelSuscripcion().getNombre());

        response.put("mensaje", "Pago aprobado exitosamente.");
        return ResponseEntity.ok(response);
    }
}
