package com.example.quanlycafe.config;

import com.example.quanlycafe.security.JwtFilter; // Đảm bảo import đúng path của JwtFilter
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter; // Inject JwtFilter để sử dụng bên dưới

    // 1. ĐỊNH NGHĨA PASSWORD ENCODER (Khắc phục lỗi bạn vừa gặp)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // Rất quan trọng để nhận diện CorsConfigurationSource bên dưới
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Dòng 1: Cho phép tất cả lệnh OPTIONS (Rất quan trọng)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // Dòng 2: Mở cửa cho API lấy danh sách nhân viên
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/nhan-vien/**").permitAll()

                        // Dòng 3: Các API khác
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/cham-cong/**").permitAll()

                        // Dòng cuối: Còn lại phải đăng nhập
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // CÁCH 1: Liệt kê cụ thể (Khuyên dùng cho môi trường Dev)
        // Thay cổng 5173 bằng cổng thực tế của React (Vite: 5173, CRA: 3000)
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));

        // CÁCH 2: Nếu muốn cho phép nhiều subdomain hoặc linh hoạt hơn
        // configuration.setAllowedOriginPatterns(List.of("http://localhost:[*]", "http://127.0.0.1:[*]"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));

        // Khi dòng này là true, AllowedOrigins KHÔNG ĐƯỢC là "*"
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}