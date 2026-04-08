package com.example.quanlycafe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                // Thay vì dùng "*", hãy liệt kê cụ thể các method
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // Thay vì dùng "*", hãy liệt kê các header quan trọng
                .allowedHeaders("Authorization", "Content-Type", "Accept", "X-Requested-With")
                .allowCredentials(true)
                .maxAge(3600); // Cache cấu hình CORS trong 1 giờ để tăng hiệu năng
    }
}
