package com.team37.skillable.SkillAble.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors().and()  // Use the CORS configuration you already defined
                .csrf().disable()  // Disable CSRF for API
                .authorizeHttpRequests()
                .anyRequest().permitAll();  // Allow all requests during development

        return http.build();
    }
}