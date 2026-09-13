package com.insteip.backend.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // The runtime must provide a unique Base64-encoded key.
    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration:1800000}") // 30 minutos en milisegundos
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, c -> c.getSubject());
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(Long id, String correo, String rol) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("id", id);
        extraClaims.put("rol", rol);
        return generateToken(extraClaims, correo);
    }

    public String generateExpToken(Long id, String correo, String rol, long expirationMillis) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("id", id);
        extraClaims.put("rol", rol);
        extraClaims.put("isExpUser", true);
        extraClaims.put("expDurationSeconds", expirationMillis / 1000);
        return Jwts.builder()
                .claims(extraClaims)
                .subject(correo)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(getSignInKey())
                .compact();
    }

    public String generateToken(Map<String, Object> extraClaims, String subject) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, c -> c.getExpiration());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
