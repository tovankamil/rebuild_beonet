package services

import (
	"testing"
	"time"

	"bionet-backend/models"
)

func TestCalculateStage(t *testing.T) {
	tests := []struct {
		current  int
		target   int
		expected string
	}{
		{0, 100, "seed"},
		{10, 100, "seed"},
		{24, 100, "seed"},
		{25, 100, "sprout"},
		{49, 100, "sprout"},
		{50, 100, "growing"},
		{74, 100, "growing"},
		{75, 100, "bloom"},
		{99, 100, "bloom"},
		{100, 100, "harvest_ready"},
		{120, 100, "harvest_ready"},
		// Non-100 target water
		{0, 200, "seed"},
		{50, 200, "sprout"},
		{100, 200, "growing"},
		{150, 200, "bloom"},
		{200, 200, "harvest_ready"},
	}

	for _, tt := range tests {
		stage := CalculateStage(tt.current, tt.target)
		if stage != tt.expected {
			t.Errorf("CalculateStage(%d, %d) = %s; want %s", tt.current, tt.target, stage, tt.expected)
		}
	}
}

func TestRegenerateWater(t *testing.T) {
	svc := NewFarmService(nil)

	// Case 1: Already at 100 droplets
	tank := &models.FarmWaterTank{
		WaterDroplets: 100,
		LastRegenAt:   time.Now().Add(-10 * time.Minute),
	}
	svc.RegenerateWater(tank)
	if tank.WaterDroplets != 100 {
		t.Errorf("Expected droplets to remain 100, got %d", tank.WaterDroplets)
	}

	// Case 2: 50 droplets, 6 minutes elapsed (+3 droplets)
	tank2 := &models.FarmWaterTank{
		WaterDroplets: 50,
		LastRegenAt:   time.Now().Add(-6 * time.Minute),
	}
	svc.RegenerateWater(tank2)
	if tank2.WaterDroplets != 53 {
		t.Errorf("Expected droplets 53, got %d", tank2.WaterDroplets)
	}

	// Case 3: 98 droplets, 10 minutes elapsed (capped at 100)
	tank3 := &models.FarmWaterTank{
		WaterDroplets: 98,
		LastRegenAt:   time.Now().Add(-10 * time.Minute),
	}
	svc.RegenerateWater(tank3)
	if tank3.WaterDroplets != 100 {
		t.Errorf("Expected droplets capped at 100, got %d", tank3.WaterDroplets)
	}

	// Case 4: Less than 2 minutes elapsed (+0 droplets)
	tank4 := &models.FarmWaterTank{
		WaterDroplets: 50,
		LastRegenAt:   time.Now().Add(-1 * time.Minute),
	}
	svc.RegenerateWater(tank4)
	if tank4.WaterDroplets != 50 {
		t.Errorf("Expected droplets to remain 50, got %d", tank4.WaterDroplets)
	}
}

func TestStandardSeedsAndCatalog(t *testing.T) {
	seeds := []string{"propolis_flower", "red_ginger", "bio_sirsak", "royal_trigona"}
	expectedTargets := map[string]int{
		"propolis_flower": 100,
		"red_ginger":      150,
		"bio_sirsak":      200,
		"royal_trigona":   300,
	}
	expectedRewards := map[string]string{
		"propolis_flower": "voucher",
		"red_ginger":      "wallet_cash",
		"bio_sirsak":      "voucher",
		"royal_trigona":   "wallet_cash",
	}

	for _, sType := range seeds {
		seed := GetSeedByType(sType)
		if seed == nil {
			t.Fatalf("Expected seed '%s' to exist in StandardSeeds catalog", sType)
		}
		if seed.TargetWater != expectedTargets[sType] {
			t.Errorf("Seed '%s': expected TargetWater %d, got %d", sType, expectedTargets[sType], seed.TargetWater)
		}
		if seed.RewardType != expectedRewards[sType] {
			t.Errorf("Seed '%s': expected RewardType %s, got %s", sType, expectedRewards[sType], seed.RewardType)
		}
	}

	// Non-existing seed
	if seed := GetSeedByType("unknown_plant"); seed != nil {
		t.Errorf("Expected nil for unknown plant type")
	}
}
