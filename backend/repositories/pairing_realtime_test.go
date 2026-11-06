package repositories

import (
	"math"
	"testing"
)

// ponytail: in-memory unit test for pairing arithmetic ceiling
func TestRealtimePairingCalculation(t *testing.T) {
	tests := []struct {
		name          string
		pointLeft     float64
		pointRight    float64
		pairedPoints  float64
		rate          float64
		expectedPairs float64
		expectedBonus float64
		expectedWaitL float64
		expectedWaitR float64
	}{
		{
			name:          "Zero initially",
			pointLeft:     0,
			pointRight:    0,
			pairedPoints:  0,
			rate:          20000,
			expectedPairs: 0,
			expectedBonus: 0,
			expectedWaitL: 0,
			expectedWaitR: 0,
		},
		{
			name:          "One leg only",
			pointLeft:     5,
			pointRight:    0,
			pairedPoints:  0,
			rate:          20000,
			expectedPairs: 0,
			expectedBonus: 0,
			expectedWaitL: 5,
			expectedWaitR: 0,
		},
		{
			name:          "First pairing 3 left 2 right",
			pointLeft:     3,
			pointRight:    2,
			pairedPoints:  0,
			rate:          20000,
			expectedPairs: 2,
			expectedBonus: 40000,
			expectedWaitL: 1,
			expectedWaitR: 0,
		},
		{
			name:          "Subsequent downline added to right leg",
			pointLeft:     3, // cumulative
			pointRight:    4, // now 4
			pairedPoints:  2, // already paired 2
			rate:          20000,
			expectedPairs: 1, // min(3,4) = 3 - 2 = 1 new pair
			expectedBonus: 20000,
			expectedWaitL: 0,
			expectedWaitR: 1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			eligiblePairs := math.Floor(math.Min(tc.pointLeft, tc.pointRight))
			newPairs := eligiblePairs - tc.pairedPoints
			if newPairs < 0 {
				newPairs = 0
			}
			if newPairs != tc.expectedPairs {
				t.Fatalf("expected pairs %.0f, got %.0f", tc.expectedPairs, newPairs)
			}
			bonus := newPairs * tc.rate
			if bonus != tc.expectedBonus {
				t.Fatalf("expected bonus %.0f, got %.0f", tc.expectedBonus, bonus)
			}
			waitL := math.Max(0, tc.pointLeft-(tc.pairedPoints+newPairs))
			waitR := math.Max(0, tc.pointRight-(tc.pairedPoints+newPairs))
			if waitL != tc.expectedWaitL || waitR != tc.expectedWaitR {
				t.Fatalf("expected waiting L:%.0f R:%.0f, got L:%.0f R:%.0f", tc.expectedWaitL, tc.expectedWaitR, waitL, waitR)
			}
		})
	}
}
