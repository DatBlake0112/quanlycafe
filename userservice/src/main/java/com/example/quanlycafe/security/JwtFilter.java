package com.example.quanlycafe.security;

import com.example.quanlycafe.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor // Sử dụng Constructor Injection thay cho @Autowired sẽ tốt hơn
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // 1. Kiểm tra Header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            String role = jwtService.extractRole(token); // Ví dụ: "ADMIN"

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Kiểm tra tính hợp lệ của token (Nếu JwtService của bạn có hàm này)
                if (jwtService.isTokenValid(token, username)) {

                    // QUAN TRỌNG: Đảm bảo role không có khoảng trắng và viết hoa
                    String finalRole = (role != null) ? role.trim().toUpperCase() : "USER";

                    // Spring Security cần "ROLE_" làm tiền tố để hiểu đó là Role
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + finalRole);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            Collections.singletonList(authority)
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Nạp vào Context
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    System.out.println("Xác thực thành công cho: " + username + " với quyền: " + authority.getAuthority());
                }
            }
        } catch (Exception e) {
            // Không chặn request, để SecurityConfig tự trả về 401/403
            System.err.println("JWT Filter Error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}