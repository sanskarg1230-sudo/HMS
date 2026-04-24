package com.hms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "mess_menu_items")
public class MessMenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    @JsonIgnore
    private MessMenu menu;

    @Column(nullable = false)
    private String day; // MONDAY-SUNDAY

    @Column(name = "meal_type", nullable = false)
    private String mealType; // BREAKFAST, LUNCH, SNACKS, DINNER

    @Column(name = "food_items", columnDefinition = "TEXT")
    private String foodItems;

    @Column(name = "week_cycle")
    private Integer weekCycle; // 1 for Weekly/Cycle W1&3; 2 for Cycle W2&4; 1-4 for Full
}
