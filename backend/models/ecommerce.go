package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	ID          string    `gorm:"type:char(36);primaryKey" json:"id"`
	Name        string    `gorm:"type:varchar(150);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Price       float64   `gorm:"type:decimal(15,2);not null" json:"price"`
	Cogs        float64   `gorm:"type:decimal(15,2);not null" json:"cogs"`
	Stock       int       `gorm:"default:0" json:"stock"`
	ImageURL    string    `gorm:"type:varchar(255)" json:"image_url"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return
}

type Order struct {
	ID          string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID      string    `gorm:"type:char(36);not null;index:idx_orders_user" json:"user_id"`
	OrderNumber string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"order_number"`
	TotalAmount float64   `gorm:"type:decimal(15,2);not null" json:"total_amount"`
	Status      string    `gorm:"type:enum('pending','paid','processing','shipped','completed','cancelled');default:'pending';index:idx_orders_user" json:"status"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User  *User       `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
	Items []OrderItem `gorm:"foreignKey:OrderID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"items,omitempty"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) (err error) {
	if o.ID == "" {
		o.ID = uuid.New().String()
	}
	return
}

type OrderItem struct {
	ID          string  `gorm:"type:char(36);primaryKey" json:"id"`
	OrderID     string  `gorm:"type:char(36);not null;index" json:"order_id"`
	ProductID   string  `gorm:"type:char(36);not null;index" json:"product_id"`
	Quantity    int     `gorm:"not null" json:"quantity"`
	PriceAtTime float64 `gorm:"type:decimal(15,2);not null" json:"price_at_time"`

	Order   *Order   `gorm:"foreignKey:OrderID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"order,omitempty"`
	Product *Product `gorm:"foreignKey:ProductID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"product,omitempty"`
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) (err error) {
	if oi.ID == "" {
		oi.ID = uuid.New().String()
	}
	return
}
