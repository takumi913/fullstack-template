// Package repo 数据访问层
package repo

import (
	"time"

	"go-react-template/pkg/database"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// DailyStats 每日统计数据.
type DailyStats struct {
	Date  string          `json:"date"`
	Count int64           `json:"count"`
	Value decimal.Decimal `json:"value,omitempty"`
}

// AdminRepo 管理员数据访问接口.
type AdminRepo interface {
	GetTotalUsers() (int64, error)
	GetTodayNewUsers() (int64, error)
	GetPayingUsers() (registered, guest int64, err error)
	GetOrderStats() (count int64, amount decimal.Decimal, err error)
	GetTodayRevenue() (decimal.Decimal, error)
	GetUserGrowth(days int) ([]DailyStats, error)
	GetRevenueGrowth(days int) ([]DailyStats, error)
}

// adminRepo 管理员数据访问实现.
type adminRepo struct {
	db *gorm.DB
}

// NewAdminRepo 创建管理员数据访问实例.
func NewAdminRepo() AdminRepo {
	return &adminRepo{
		db: database.GetDB(),
	}
}

// GetTotalUsers 获取总用户数.
func (r *adminRepo) GetTotalUsers() (int64, error) {
	var count int64

	err := r.db.Table("users").Where("deleted_at IS NULL").Count(&count).Error

	return count, err
}

// GetTodayNewUsers 获取今日新增用户数.
func (r *adminRepo) GetTodayNewUsers() (int64, error) {
	var count int64

	today := time.Now().Format("2006-01-02")
	err := r.db.Table("users").
		Where("deleted_at IS NULL").
		Where("DATE(created_at) = ?", today).
		Count(&count).Error

	return count, err
}

// GetPayingUsers 获取付费用户数（已注册和游客）.
func (r *adminRepo) GetPayingUsers() (registered, guest int64, err error) {
	// 已注册且付费的用户数
	err = r.db.Table("payments").
		Joins("JOIN users ON payments.user_id = users.id").
		Where("payments.status = ?", "completed").
		Where("users.deleted_at IS NULL").
		Distinct("payments.user_id").
		Count(&registered).Error
	if err != nil {
		return 0, 0, err
	}

	// 游客付费数（user_id 为空或不存在于 users 表）
	err = r.db.Table("payments").
		Where("status = ?", "completed").
		Where("user_id IS NULL OR user_id = '' OR user_id NOT IN (SELECT id FROM users WHERE deleted_at IS NULL)").
		Count(&guest).Error
	if err != nil {
		return 0, 0, err
	}

	return registered, guest, nil
}

// GetOrderStats 获取订单统计.
func (r *adminRepo) GetOrderStats() (count int64, amount decimal.Decimal, err error) {
	type Result struct {
		Count  int64
		Amount decimal.Decimal
	}

	var result Result

	err = r.db.Table("payments").
		Select("COUNT(*) as count, COALESCE(SUM(amount), 0) as amount").
		Where("status = ?", "completed").
		Scan(&result).Error
	if err != nil {
		return 0, decimal.Zero, err
	}

	return result.Count, result.Amount, nil
}

// GetTodayRevenue 获取今日收入.
func (r *adminRepo) GetTodayRevenue() (decimal.Decimal, error) {
	var amount decimal.Decimal

	today := time.Now().Format("2006-01-02")
	err := r.db.Table("payments").
		Select("COALESCE(SUM(amount), 0)").
		Where("status = ?", "completed").
		Where("DATE(created_at) = ?", today).
		Scan(&amount).Error

	return amount, err
}

// GetUserGrowth 获取用户增长趋势.
func (r *adminRepo) GetUserGrowth(days int) ([]DailyStats, error) {
	var stats []DailyStats

	err := r.db.Table("users").
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("deleted_at IS NULL").
		Where("created_at >= ?", time.Now().AddDate(0, 0, -days)).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&stats).Error

	return stats, err
}

// GetRevenueGrowth 获取收入增长趋势.
func (r *adminRepo) GetRevenueGrowth(days int) ([]DailyStats, error) {
	var stats []DailyStats

	err := r.db.Table("payments").
		Select("DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(amount), 0) as value").
		Where("status = ?", "completed").
		Where("created_at >= ?", time.Now().AddDate(0, 0, -days)).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&stats).Error

	return stats, err
}
