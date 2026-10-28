package models

type DashboardStatsResponse struct {
	User                 User                `json:"user"`
	WalletBalance        float64             `json:"wallet_balance"`
	PointLeft            float64             `json:"point_left"`
	PointRight           float64             `json:"point_right"`
	TotalBonusMonth      float64             `json:"total_bonus_month"`
	DirectReferralsCount int64               `json:"direct_referrals_count"`
	TotalNetworkCount    int64               `json:"total_network_count"`
	RecentTransactions   []WalletTransaction `json:"recent_transactions"`
	Bank                 *UserBank           `json:"bank,omitempty"`
}

type ReferralItem struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	FullName  string `json:"full_name"`
	Phone     string `json:"phone"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
}

type BinaryNode struct {
	ID             string      `json:"id"`
	Username       string      `json:"username"`
	FullName       string      `json:"full_name"`
	Position       string      `json:"position"` // "root", "kiri", "kanan"
	Status         string      `json:"status"`
	PointLeft      float64     `json:"point_left"`
	PointRight     float64     `json:"point_right"`
	UplineID       *string     `json:"upline_id,omitempty"`
	UplineUsername *string     `json:"upline_username,omitempty"`
	LeftNode       *BinaryNode `json:"left_node,omitempty"`
	RightNode      *BinaryNode `json:"right_node,omitempty"`
}
