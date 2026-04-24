package com.hms.config;

import com.hms.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
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

    private final JwtAuthFilter jwtAuthFilter;

    /**
     * When hms.require.https=true (production profile) Spring Security will:
     *  - Redirect all HTTP requests to HTTPS
     *  - Trust X-Forwarded-Proto headers from nginx so the redirect works correctly
     *    behind a reverse proxy (configured via server.forward-headers-strategy=framework)
     *
     * Default is false so local development (HTTP) is completely unaffected.
     */
    @Value("${hms.require.https:false}")
    private boolean requireHttps;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/admin-request").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                // Super Admin only
                .requestMatchers("/api/admin-requests/**").hasAuthority("super_admin")
                .requestMatchers(HttpMethod.GET, "/api/contact/messages").hasAuthority("super_admin")
                .requestMatchers(HttpMethod.PUT, "/api/contact/**").hasAuthority("super_admin")
                .requestMatchers(HttpMethod.GET, "/api/bugs").hasAuthority("super_admin")
                .requestMatchers(HttpMethod.GET, "/api/bugs/*/screenshot").hasAuthority("super_admin")
                .requestMatchers(HttpMethod.PUT, "/api/bugs/**").hasAuthority("super_admin")
                // Authenticated (any role)
                .requestMatchers(HttpMethod.POST, "/api/bugs/report").authenticated()
                // Role-based endpoints
                .requestMatchers("/api/admin/**").hasAuthority("admin")
                .requestMatchers("/api/student/**").hasAuthority("student")
                // Student profile & documents
                .requestMatchers("/api/student/full-profile").hasAuthority("student")
                .requestMatchers("/api/student/profile/**").hasAuthority("student")
                .requestMatchers("/api/student/leave/**").hasAuthority("student")
                .requestMatchers("/api/student/documents/**").hasAuthority("student")
                // Admin management of student profiles/documents/leave
                .requestMatchers("/api/admin/students/*/profile").hasAuthority("admin")
                .requestMatchers("/api/admin/students/*/leave").hasAuthority("admin")
                .requestMatchers("/api/admin/students/*/documents").hasAuthority("admin")
                .requestMatchers("/api/admin/students/*/medical").hasAuthority("admin")
                .requestMatchers("/api/admin/documents/**").hasAuthority("admin")
                .requestMatchers("/api/admin/leave/**").hasAuthority("admin")
                .requestMatchers("/api/mess/menu/**").hasAnyAuthority("admin", "student")
                .requestMatchers("/api/notices/**").hasAnyAuthority("admin", "student")
                .requestMatchers("/api/rooms/**").hasAuthority("admin")
                .requestMatchers("/api/fees/**").hasAnyAuthority("admin", "student")
                .requestMatchers("/api/complaints/**").hasAnyAuthority("admin", "student")
                .anyRequest().authenticated()
            )
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // ── HTTPS enforcement (production only) ───────────────────────────────
        // Enabled when hms.require.https=true (set in application-prod.properties).
        // Redirects all HTTP traffic to HTTPS at the Spring Security layer.
        if (requireHttps) {
            http.requiresChannel(channel -> channel.anyRequest().requiresSecure());
        }

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
