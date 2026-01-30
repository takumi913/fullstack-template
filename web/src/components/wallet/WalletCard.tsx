import { Wallet, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";

export function WalletCard() {
  const { wallet, isLoading } = useWalletStore();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white animate-pulse">
        <div className="h-4 w-24 bg-white/20 rounded mb-4" />
        <div className="h-8 w-32 bg-white/20 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-medium text-white/80">Balance</span>
        </div>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
          {wallet?.currency || "USD"}
        </span>
      </div>
      <div className="text-3xl font-bold mb-2">
        ${wallet?.balance || "0.00"}
      </div>
      <p className="text-sm text-white/70">
        Available credits for AI tools
      </p>
    </div>
  );
}

export function WalletStats() {
  const { transactions } = useWalletStore();

  const totalTopup = transactions
    .filter((t) => t.type === "topup" && t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalSpent = transactions
    .filter((t) => t.type === "consume" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-sm text-gray-500">Total Added</span>
        </div>
        <div className="text-xl font-semibold text-gray-900">
          ${totalTopup.toFixed(2)}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm text-gray-500">Total Spent</span>
        </div>
        <div className="text-xl font-semibold text-gray-900">
          ${totalSpent.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export function RecentTransactions() {
  const { transactions, isLoading } = useWalletStore();
  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-sm text-gray-400">
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentTransactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === "topup"
                  ? "bg-green-100"
                  : tx.type === "consume"
                  ? "bg-orange-100"
                  : "bg-gray-100"
              }`}
            >
              {tx.type === "topup" ? (
                <TrendingUp
                  className={`w-5 h-5 ${
                    tx.type === "topup" ? "text-green-600" : "text-gray-600"
                  }`}
                />
              ) : (
                <TrendingDown
                  className={`w-5 h-5 ${
                    tx.type === "consume" ? "text-orange-600" : "text-gray-600"
                  }`}
                />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 capitalize">
                {tx.type}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(tx.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div
            className={`font-semibold ${
              parseFloat(tx.amount) >= 0 ? "text-green-600" : "text-orange-600"
            }`}
          >
            {parseFloat(tx.amount) >= 0 ? "+" : ""}
            {tx.amount}
          </div>
        </div>
      ))}
    </div>
  );
}
