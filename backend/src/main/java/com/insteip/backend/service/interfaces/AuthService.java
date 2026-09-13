package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.auth.LoginRequest;
import com.insteip.backend.domain.dto.auth.LoginResponse;
import com.insteip.backend.domain.dto.auth.LogoutRequest;
import com.insteip.backend.domain.dto.auth.TokenRefreshRequest;
import com.insteip.backend.domain.dto.auth.TokenRefreshResponse;
import com.insteip.backend.domain.dto.auth.UserProfileResponse;
import com.insteip.backend.domain.dto.auth.ChangePasswordRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    UserProfileResponse getProfile(String correo);
    TokenRefreshResponse refreshToken(TokenRefreshRequest request);
    void logout(LogoutRequest request);
    void forgotPassword(String correo);
    void resetPassword(String token, String newPassword);
    void changePassword(String correo, ChangePasswordRequest request);
}
