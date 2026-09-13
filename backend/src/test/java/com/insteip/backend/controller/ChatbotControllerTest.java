package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.chatbot.ChatRequest;
import com.insteip.backend.domain.dto.chatbot.ChatResponse;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.infrastructure.security.JwtService;
import com.insteip.backend.service.ChatbotService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.ArrayList;

@WebMvcTest(
        controllers = ChatbotController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                DataSourceAutoConfiguration.class,
                HibernateJpaAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
public class ChatbotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatbotService chatbotService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private AuthenticationProvider authenticationProvider;

    @Test
    public void testChatbotEndpointIsPublic() throws Exception {
        ChatRequest request = new ChatRequest("Hola", new ArrayList<>());
        ChatResponse expectedResponse = new ChatResponse("Respuesta simulada");

        Mockito.when(chatbotService.processChat(Mockito.any(ChatRequest.class)))
                .thenReturn(expectedResponse);

        mockMvc.perform(MockMvcRequestBuilders.post("/api/chatbot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.response").value("Respuesta simulada"));
    }
}
