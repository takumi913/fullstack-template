import { useState } from "react";
import { X, CreditCard, Sparkles, Check } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import type { PricingTier } from "@/api";

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopupModal({ isOpen, onClose }: TopupModalProps) {
  const { pricingTiers, topup, isLoading } = useWalletStore();
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<"stripe" | "creem">("stripe");

  const handleTopup = async () => {
    if (!selectedTier) return;

    const checkoutUrl = await topup(parseFloat(selectedTier.amount), selectedProvider);
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add Credits</h2>
              <p className="text-sm text-gray-500">Choose a package below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Pricing Tiers */}
        <div className="p-6 space-y-3">
          {pricingTiers.map((tier) => (
            <button
              key={tier.amount}
              onClick={() => setSelectedTier(tier)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedTier?.amount === tier.amount
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedTier?.amount === tier.amount
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedTier?.amount === tier.amount && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        ${tier.amount}
                      </span>
                      {tier.popular && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{tier.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-indigo-600">
                    {tier.credits} credits
                  </div>
                  {tier.bonus_rate > 0 && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{(tier.bonus_rate * 100).toFixed(0)}% bonus
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Payment Provider */}
        <div className="px-6 pb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedProvider("stripe")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                selectedProvider === "stripe"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-gray-900">Stripe</div>
              <div className="text-xs text-gray-500">Cards, Apple Pay</div>
            </button>
            <button
              onClick={() => setSelectedProvider("creem")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                selectedProvider === "creem"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-gray-900">Creem</div>
              <div className="text-xs text-gray-500">Crypto, USDT</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleTopup}
            disabled={!selectedTier || isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {isLoading ? "Processing..." : "Continue to Payment"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">
            Secure payment powered by {selectedProvider === "stripe" ? "Stripe" : "Creem"}
          </p>
        </div>
      </div>
    </div>
  );
}
