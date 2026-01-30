// Package service 业务逻辑层，处理核心业务逻辑
package service

import (
	"errors"
	"time"

	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"

	"github.com/shopspring/decimal"
)

// WalletService 钱包业务逻辑接口.
type WalletService interface {
	GetOrCreateWallet(userID string) (*model.WalletResponse, error)
	GetBalance(userID string) (*model.WalletResponse, error)
	GetTransactions(userID string, req *model.TransactionListRequest) ([]model.TransactionResponse, int64, error)
	CreateTopupPayment(userID string, req *model.TopupRequest) (*model.TopupResponse, error)
	ProcessPaymentSuccess(externalID string, provider model.PaymentProvider) error
	ProcessStripeWebhook(payload []byte, signature string) error
	Consume(userID string, amount decimal.Decimal, description string, reference string) error
	GetPricingTiers() []model.PricingTier
}

// walletService 钱包业务逻辑实现.
type walletService struct {
	walletRepo    repo.WalletRepo
	userRepo      repo.UserRepo
	stripeService StripeService
}

// NewWalletService 创建钱包业务逻辑实例.
func NewWalletService(walletRepo repo.WalletRepo, userRepo repo.UserRepo, stripeService StripeService) WalletService {
	return &walletService{
		walletRepo:    walletRepo,
		userRepo:      userRepo,
		stripeService: stripeService,
	}
}

// GetOrCreateWallet 获取或创建用户钱包.
func (s *walletService) GetOrCreateWallet(userID string) (*model.WalletResponse, error) {
	wallet, err := s.walletRepo.GetByUserID(userID)
	if err == nil {
		resp := wallet.ToResponse()

		return &resp, nil
	}

	if _, err := s.userRepo.GetByID(userID); err != nil {
		return nil, errors.New("用户不存在")
	}

	wallet = &model.Wallet{
		UserID:   userID,
		Balance:  decimal.Zero,
		Currency: "USD",
	}

	if err := s.walletRepo.Create(wallet); err != nil {
		return nil, errors.New("创建钱包失败")
	}

	resp := wallet.ToResponse()

	return &resp, nil
}

// GetBalance 获取钱包余额.
func (s *walletService) GetBalance(userID string) (*model.WalletResponse, error) {
	return s.GetOrCreateWallet(userID)
}

// GetTransactions 获取交易记录.
func (s *walletService) GetTransactions(userID string, req *model.TransactionListRequest) ([]model.TransactionResponse, int64, error) {
	wallet, err := s.walletRepo.GetByUserID(userID)
	if err != nil {
		return nil, 0, errors.New("钱包不存在")
	}

	page := req.Page
	if page < 1 {
		page = 1
	}

	pageSize := req.PageSize
	if pageSize < 1 {
		pageSize = 20
	}

	transactions, total, err := s.walletRepo.GetTransactions(wallet.ID, page, pageSize, req.Type)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]model.TransactionResponse, len(transactions))
	for i, tx := range transactions {
		responses[i] = tx.ToResponse()
	}

	return responses, total, nil
}

// CreateTopupPayment 创建充值支付订单.
//
//nolint:gocyclo // 支付流程需要处理多种情况
func (s *walletService) CreateTopupPayment(userID string, req *model.TopupRequest) (*model.TopupResponse, error) {
	wallet, err := s.GetOrCreateWallet(userID)
	if err != nil {
		return nil, err
	}

	user, userErr := s.userRepo.GetByID(userID)

	userEmail := ""
	if userErr == nil && user != nil {
		userEmail = user.Email
	}

	creditAmount := s.calculateCredits(req.Amount)

	expiresAt := time.Now().Add(30 * time.Minute)
	payment := &model.Payment{
		UserID:       userID,
		WalletID:     wallet.ID,
		Provider:     req.Provider,
		Status:       model.PaymentStatusPending,
		Amount:       req.Amount,
		Currency:     "USD",
		CreditAmount: creditAmount,
		ExpiresAt:    &expiresAt,
	}

	if err := s.walletRepo.CreatePayment(payment); err != nil {
		return nil, errors.New("创建支付订单失败")
	}

	var (
		checkoutURL string
		externalID  string
	)

	switch req.Provider {
	case model.PaymentProviderStripe:
		if s.stripeService == nil {
			return nil, errors.New("Stripe服务未配置")
		}

		externalID, checkoutURL, err = s.stripeService.CreateCheckoutSession(payment, userEmail)
		if err != nil {
			return nil, errors.New("创建Stripe支付失败: " + err.Error())
		}
	case model.PaymentProviderCreem:
		return nil, errors.New("Creem支付暂未开放")
	default:
		return nil, errors.New("不支持的支付方式")
	}

	payment.ExternalID = externalID
	payment.CheckoutURL = checkoutURL

	if err := s.walletRepo.UpdatePayment(payment); err != nil {
		return nil, errors.New("更新支付订单失败")
	}

	return &model.TopupResponse{
		PaymentID:   payment.ID,
		CheckoutURL: checkoutURL,
	}, nil
}

// ProcessPaymentSuccess 处理支付成功回调.
func (s *walletService) ProcessPaymentSuccess(externalID string, provider model.PaymentProvider) error {
	payment, err := s.walletRepo.GetPaymentByExternalID(externalID)
	if err != nil {
		return errors.New("支付订单不存在")
	}

	if payment.Status != model.PaymentStatusPending {
		return nil
	}

	if payment.Provider != provider {
		return errors.New("支付提供商不匹配")
	}

	return s.walletRepo.WithTx(func(txRepo repo.WalletRepo) error {
		wallet, err := txRepo.GetByID(payment.WalletID)
		if err != nil {
			return err
		}

		balanceBefore := wallet.Balance
		balanceAfter := balanceBefore.Add(payment.CreditAmount)

		if err := txRepo.UpdateBalance(wallet.ID, payment.CreditAmount); err != nil {
			return err
		}

		transaction := &model.Transaction{
			WalletID:      wallet.ID,
			Type:          model.TransactionTypeTopup,
			Status:        model.TransactionStatusCompleted,
			Amount:        payment.CreditAmount,
			BalanceBefore: balanceBefore,
			BalanceAfter:  balanceAfter,
			Description:   "充值 " + payment.Amount.String() + " " + payment.Currency,
			Reference:     payment.ID,
		}

		if err := txRepo.CreateTransaction(transaction); err != nil {
			return err
		}

		now := time.Now()
		payment.Status = model.PaymentStatusCompleted
		payment.WebhookReceived = true
		payment.CompletedAt = &now

		return txRepo.UpdatePayment(payment)
	})
}

// ProcessStripeWebhook 处理Stripe Webhook事件.
func (s *walletService) ProcessStripeWebhook(payload []byte, signature string) error {
	if s.stripeService == nil {
		return errors.New("Stripe服务未配置")
	}

	event, err := s.stripeService.ValidateWebhookSignature(payload, signature)
	if err != nil {
		return errors.New("Webhook签名验证失败: " + err.Error())
	}

	if event.Type == "checkout.session.completed" {
		sessionID, ok := event.Data.Object["id"].(string)
		if !ok {
			return errors.New("无法获取session ID")
		}

		return s.ProcessPaymentSuccess(sessionID, model.PaymentProviderStripe)
	}

	return nil
}

// Consume 消费积分.
func (s *walletService) Consume(userID string, amount decimal.Decimal, description string, reference string) error {
	if amount.LessThanOrEqual(decimal.Zero) {
		return errors.New("消费金额必须大于0")
	}

	wallet, err := s.walletRepo.GetByUserID(userID)
	if err != nil {
		return errors.New("钱包不存在")
	}

	if wallet.Balance.LessThan(amount) {
		return errors.New("余额不足")
	}

	return s.walletRepo.WithTx(func(txRepo repo.WalletRepo) error {
		wallet, err := txRepo.GetByID(wallet.ID)
		if err != nil {
			return err
		}

		if wallet.Balance.LessThan(amount) {
			return errors.New("余额不足")
		}

		balanceBefore := wallet.Balance
		balanceAfter := balanceBefore.Sub(amount)

		if err := txRepo.UpdateBalance(wallet.ID, amount.Neg()); err != nil {
			return err
		}

		transaction := &model.Transaction{
			WalletID:      wallet.ID,
			Type:          model.TransactionTypeConsume,
			Status:        model.TransactionStatusCompleted,
			Amount:        amount.Neg(),
			BalanceBefore: balanceBefore,
			BalanceAfter:  balanceAfter,
			Description:   description,
			Reference:     reference,
		}

		return txRepo.CreateTransaction(transaction)
	})
}

// GetPricingTiers 获取定价层级.
func (s *walletService) GetPricingTiers() []model.PricingTier {
	return model.GetPricingTiers()
}

// calculateCredits 根据支付金额计算到账积分.
func (s *walletService) calculateCredits(amount decimal.Decimal) decimal.Decimal {
	tiers := model.GetPricingTiers()

	for _, tier := range tiers {
		if tier.Amount.Equal(amount) {
			return tier.Credits
		}
	}

	return amount.Mul(decimal.NewFromInt(100))
}
