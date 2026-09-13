package com.insteip.backend.service;

import com.insteip.backend.domain.dto.chatbot.ChatMessage;
import com.insteip.backend.domain.dto.chatbot.ChatRequest;
import com.insteip.backend.domain.dto.chatbot.ChatResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChatbotService {

    @Value("${application.chatbot.groq-api-key:}")
    private String groqApiKey;

    @Value("${application.chatbot.groq-model:llama-3.1-8b-instant}")
    private String groqModel;

    @Value("${application.chatbot.gemini-api-key:}")
    private String geminiApiKey;

    @Value("${application.chatbot.gemini-model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${application.chatbot.openrouter-api-key:}")
    private String openRouterApiKey;

    @Value("${application.chatbot.openrouter-model:meta-llama/llama-3-8b-instruct:free}")
    private String openRouterModel;

    @Value("${application.chatbot.context-path}")
    private String contextPath;

    private final RestTemplate restTemplate;

    public ChatbotService() {
        this.restTemplate = new RestTemplate();
        this.restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
    }

    private List<AIProviderConfig> getActiveProviders() {
        List<AIProviderConfig> providers = new ArrayList<>();

        if (isKeyValid(groqApiKey)) {
            providers.add(new AIProviderConfig(
                    "Groq",
                    "https://api.groq.com/openai/v1/chat/completions",
                    groqApiKey,
                    groqModel
            ));
        }

        if (isKeyValid(geminiApiKey)) {
            providers.add(new AIProviderConfig(
                    "Gemini",
                    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                    geminiApiKey,
                    geminiModel
            ));
        }

        if (isKeyValid(openRouterApiKey)) {
            providers.add(new AIProviderConfig(
                    "OpenRouter",
                    "https://openrouter.ai/api/v1/chat/completions",
                    openRouterApiKey,
                    openRouterModel
            ));
        }

        return providers;
    }

    private boolean isKeyValid(String key) {
        return key != null && !key.trim().isEmpty() && !key.startsWith("${");
    }

    public ChatResponse processChat(ChatRequest request) {
        // 1. Leer el archivo de contexto infoInsteip.md de manera dinámica
        String context = readContextFile();

        // 2. Compilar el prompt del sistema delimitador
        String systemPrompt = "Eres el asistente virtual oficial de INSTEIP (Instituto de Terapias Integrales).\n" +
                "Tu objetivo es dar respuestas SIEMPRE BREVES, DIRECTAS y concisas (máximo 2 a 3 líneas), acompañadas de botones de acción interactivos en formato [button:Texto del Botón](URL).\n\n" +
                "=== INFORMACIÓN OFICIAL DE INSTEIP (CONTEXTO) ===\n" +
                context + "\n" +
                "================================================\n\n" +
                "REGLAS CRÍTICAS DE RESPUESTA:\n" +
                "1. Respuestas Ultra Breves: Responde en español en un máximo de 2 a 3 líneas o viñetas muy cortas. PROHIBIDO escribir párrafos largos o explicaciones pesadas.\n" +
                "2. NO listes todos los cursos si la pregunta es general (ej: 'qué cursos tienen'). En su lugar, menciona en 1 frase que tenemos cursos presenciales y online, e incluye los botones correspondientes.\n" +
                "3. Botones de Acción Obligatorios: NUNCA uses comillas invertidas (backticks) ni bloques de código alrededor de los botones. Escribe exactamente [button:Texto](URL):\n" +
                "   - WhatsApp de Admisión: [button:💬 Hablar por WhatsApp](https://wa.me/51939371250?text=Hola%20Insteip%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n)\n" +
                "   - Sede Huánuco (Contacto): [button:💬 Contactar vía WhatsApp](https://wa.me/51935354183?text=Hola%20Insteip%2C%20deseo%20contactar%20con%20la%20Coordinaci%C3%B3n%20de%20la%20Sede%20Hu%C3%A1nuco%20para%20m%C3%A1s%20informaci%C3%B3n)\n" +
                "   - Cursos Presenciales: [button:🏫 Ver Cursos Presenciales](/cursos-presenciales)\n" +
                "   - Cursos Virtuales / Online: [button:💻 Ver Cursos Online](/cursos-online)\n" +
                "   - Sedes y Ubicaciones: [button:📍 Conocer Nuestras Sedes](/sedes)\n" +
                "   - Certificación: [button:🔍 Validar Certificado](/certificacion)\n" +
                "4. TEMARIOS EN PDF DISPONIBLES (Únicamente estos 4 cursos tienen PDF descargable directamente):\n" +
                "   - Auriculoterapia (Online o Presencial): [button:📥 Descargar Temario (PDF)](/assets/temarios/temario-auriculoterapia.pdf)\n" +
                "   - Acupuntura China 12 Meses (Online o Presencial): [button:📥 Descargar Temario (PDF)](/assets/temarios/temario-acupuntura-12-meses.pdf)\n" +
                "   - Acupuntura China 7 Meses (Online o Presencial): [button:📥 Descargar Temario (PDF)](/assets/temarios/temario-acupuntura-7-meses.pdf)\n" +
                "   - Digitopresión Mecánica (Online o Presencial): [button:📥 Descargar Temario (PDF)](/assets/temarios/temario-digitopresion.pdf)\n" +
                "   * Si el usuario consulta por cualquier otro curso, indícale que puede solicitar el temario y brochure oficial por WhatsApp e incluye el botón de WhatsApp.\n" +
                "5. SEDE HUÁNUCO: Si el usuario pregunta por la sede Huánuco o contacto en Huánuco, NUNCA escribas el número de teléfono como texto; incluye obligatoriamente el botón: [button:💬 Contactar vía WhatsApp](https://wa.me/51935354183?text=Hola%20Insteip%2C%20deseo%20contactar%20con%20la%20Coordinaci%C3%B3n%20de%20la%20Sede%20Hu%C3%A1nuco%20para%20m%C3%A1s%20informaci%C3%B3n)\n" +
                "6. Precios: Indica el precio exacto en 1 sola línea breve y pon el botón directo a WhatsApp para inscribirse.\n" +
                "7. NO ofrezcas descuentos ni cupones de ningún tipo.\n" +
                "8. Mantén un tono cordial y profesional utilizando emojis adecuados (🌿, 🎓, 🏫, 💻, 💬, 📍).";

        // 3. Preparar la lista de mensajes (System Prompt + Historial + Mensaje actual)
        List<ChatMessage> messages = new ArrayList<>();
        messages.add(ChatMessage.builder().role("system").content(systemPrompt).build());

        if (request.getHistory() != null) {
            // Filtrar y sanitizar historial para evitar inyecciones masivas
            List<ChatMessage> validHistory = new ArrayList<>();
            for (ChatMessage msg : request.getHistory()) {
                if ("user".equals(msg.getRole()) || "assistant".equals(msg.getRole())) {
                    validHistory.add(msg);
                }
            }
            // Limitar a los últimos 4 mensajes del historial para no sobrepasar el límite de tokens
            int keepFrom = Math.max(0, validHistory.size() - 4);
            for (int i = keepFrom; i < validHistory.size(); i++) {
                messages.add(validHistory.get(i));
            }
        }

        // Agregar el mensaje actual del usuario
        messages.add(ChatMessage.builder().role("user").content(request.getMessage()).build());

        // Obtener proveedores de IA configurados
        List<AIProviderConfig> providers = getActiveProviders();
        if (providers.isEmpty()) {
            log.error("No hay proveedores de IA configurados o válidos.");
            return new ChatResponse("Lo siento, el asistente virtual no está disponible o no está configurado correctamente en este momento. Por favor, comunícate al WhatsApp oficial +51 939 371 250.");
        }

        // Intentar con cada proveedor en orden
        for (AIProviderConfig provider : providers) {
            try {
                log.info("Enviando petición a {} utilizando modelo: {}", provider.getName(), provider.getModel());

                // Preparar el payload
                GroqRequestPayload payload = GroqRequestPayload.builder()
                        .model(provider.getModel())
                        .messages(messages)
                        .temperature(0.3)
                        .build();

                // Configurar cabeceras de autorización
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + provider.getApiKey());

                HttpEntity<GroqRequestPayload> entity = new HttpEntity<>(payload, headers);

                ResponseEntity<Map> responseEntity = restTemplate.postForEntity(provider.getUrl(), entity, Map.class);
                Map<String, Object> body = responseEntity.getBody();

                if (body != null && body.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> firstChoice = choices.get(0);
                        if (firstChoice.containsKey("message")) {
                            Map<String, Object> messageMap = (Map<String, Object>) firstChoice.get("message");
                            if (messageMap.containsKey("content")) {
                                String reply = (String) messageMap.get("content");
                                return new ChatResponse(reply);
                            }
                        }
                    }
                }
                log.warn("El proveedor {} retornó un cuerpo de respuesta inesperado o vacío.", provider.getName());
            } catch (Exception e) {
                log.error("Error al comunicarse con el proveedor {}: {}", provider.getName(), e.getMessage());
                // El bucle continuará al siguiente proveedor disponible
            }
        }

        // Si todos los proveedores fallaron
        log.error("Todos los proveedores de IA configurados fallaron secuencialmente.");
        return new ChatResponse("Lo siento, experimenté un problema al conectar con mis servicios de asistencia virtual. Por favor, comunícate al WhatsApp oficial +51 939 371 250.");
    }

    private String readContextFile() {
        try {
            // Ruta principal configurada
            Path path = Path.of(contextPath);
            if (Files.exists(path)) {
                return Files.readString(path, StandardCharsets.UTF_8);
            }
            // Fallback 1: Buscar en el directorio padre de la ejecución del backend
            Path parentPath = Path.of("..", "infoInsteip.md");
            if (Files.exists(parentPath)) {
                return Files.readString(parentPath, StandardCharsets.UTF_8);
            }
            // Fallback 2: Buscar en el directorio actual
            Path currentPath = Path.of("infoInsteip.md");
            if (Files.exists(currentPath)) {
                return Files.readString(currentPath, StandardCharsets.UTF_8);
            }
            log.warn("Archivo infoInsteip.md no encontrado en ninguna ruta. Utilizando contexto vacío.");
        } catch (IOException e) {
            log.error("Error al leer el archivo de contexto infoInsteip.md: ", e);
        }
        return "No hay información disponible actualmente.";
    }

    @Data
    @Builder
    private static class GroqRequestPayload {
        private String model;
        private List<ChatMessage> messages;
        private double temperature;
    }

    @Getter
    @AllArgsConstructor
    private static class AIProviderConfig {
        private String name;
        private String url;
        private String apiKey;
        private String model;
    }
}
