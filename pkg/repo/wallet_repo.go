// Package repo 数据访问层，负责与数据库进行交互
package repo

import (
	"errors"

	"go-react-template/pkg/database"
	"go-react-template/pkg/model"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// WalletRepo 钱包数据访问接口.
type WalletRepo interface {
	Create(wallet *model.Wallet) error
	GetByUserID(userID string) (*model.Wallet, error)
	GetByID(id string) (*model.Wallet, error)
	UpdateBalance(walletID string, amount decimal.Decimal) error
	CreateTransaction(tx *model.Transaction) error
	GetTransactions(walletID string, page, pageSize int, txType model.TransactionType) ([]model.Transaction, int64, error)
	CreatePayment(payment *model.Payment) error
	GetPaymentByID(id string) (*model.Payment, error)
	GetPaymentByExternalID(externalID string) (*model.Payment, error)
	UpdatePayment(payment *model.Payment) error
	WithTx(fn func(repo WalletRepo) error) error
}

// walletRepo 钱包数据访问实现.
type walletRepo struct {
	db *gorm.DB
}

// NewWalletRepo 创建钱包数据访问实例.
func NewWalletRepo() WalletRepo {
	return &walletRepo{
		db: database.GetDB(),
	}
}

// newWalletRepoWithDB 使用指定DB创建实例（用于事务）.
func newWalletRepoWithDB(db *gorm.DB) WalletRepo {
	return &walletRepo{db: db}
}

// Create 创建钱包.
func (r *walletRepo) Create(wallet *model.Wallet) error {
	return r.db.Create(wallet).Error
}

// GetByUserID 根据用户ID获取钱包.
func (r *walletRepo) GetByUserID(userID string) (*model.Wallet, error) {
	var wallet model.Wallet

	err := r.db.Where("user_id = ?", userID).First(&wallet).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("钱包不存在")
		}

		return nil, err
	}

	return &wallet, nil
}

// GetByID 根据ID获取钱包.
func (r *walletRepo) GetByID(id string) (*model.Wallet, error) {
	var wallet model.Wallet

	err := r.db.Where("id = ?", id).First(&wallet).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("钱包不存在")
		}

		return nil, err
	}

	return &wallet, nil
}

// UpdateBalance 更新钱包余额（使用悲观锁）.
func (r *walletRepo) UpdateBalance(walletID string, amount decimal.Decimal) error {
	return r.db.Model(&model.Wallet{}).
		Where("id = ?", walletID).
		Update("balance", gorm.Expr("balance + ?", amount)).Error
}

// CreateTransaction 创建交易记录.
func (r *walletRepo) CreateTransaction(tx *model.Transaction) error {
	return r.db.Create(tx).Error
}

// GetTransactions 获取交易记录列表.
func (r *walletRepo) GetTransactions(walletID string, page, pageSize int, txType model.TransactionType) ([]model.Transaction, int64, error) {
	var (
		transactions []model.Transaction
		total        int64
	)

	query := r.db.Model(&model.Transaction{}).Where("wallet_id = ?", walletID)

	if txType != "" {
		query = query.Where("type = ?", txType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize

	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&transactions).Error; err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

// CreatePayment 创建支付订单.
func (r *walletRepo) CreatePayment(payment *model.Payment) error {
	return r.db.Create(payment).Error
}

// GetPaymentByID 根据ID获取支付订单.
func (r *walletRepo) GetPaymentByID(id string) (*model.Payment, error) {
	var payment model.Payment

	err := r.db.Where("id = ?", id).First(&payment).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("支付订单不存在")
		}

		return nil, err
	}

	return &payment, nil
}

// GetPaymentByExternalID 根据外部ID获取支付订单.
func (r *walletRepo) GetPaymentByExternalID(externalID string) (*model.Payment, error) {
	var payment model.Payment

	err := r.db.Where("external_id = ?", externalID).First(&payment).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("支付订单不存在")
		}

		return nil, err
	}

	return &payment, nil
}

// UpdatePayment 更新支付订单.
func (r *walletRepo) UpdatePayment(payment *model.Payment) error {
	return r.db.Save(payment).Error
}

// WithTx 在事务中执行操作.
func (r *walletRepo) WithTx(fn func(repo WalletRepo) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		txRepo := newWalletRepoWithDB(tx)

		return fn(txRepo)
	})
}
