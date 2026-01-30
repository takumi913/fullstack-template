import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";
import { User, LogOut, Plus, Image, Languages, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { WalletCard, WalletStats, RecentTransactions, TopupModal } from "@/components/wallet";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { fetchBalance, fetchTransactions, fetchPricing } = useWalletStore();
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    fetchPricing();
  }, [fetchBalance, fetchTransactions, fetchPricing]);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <SEO
        title="Dashboard"
        description="Your MDZZ dashboard. Manage your account, credits, and access all AI tools."
        canonicalUrl="/dashboard"
        noindex={true}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.username || "User"}!
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your credits and access AI tools
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Wallet */}
            <div className="lg:col-span-1 space-y-6">
              {/* Wallet Card */}
              <WalletCard />

              {/* Add Credits Button */}
              <button
                onClick={() => setIsTopupModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Credits
              </button>

              {/* Stats */}
              <WalletStats />
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Tools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/remove-watermark"
                    className="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                        <Image className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            Remove Watermark
                          </h3>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Remove watermarks, logos, and unwanted objects
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/translate-image"
                    className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                        <Languages className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            Translate Image
                          </h3>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Translate text in images, manga, and comics
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Transactions
                  </h2>
                </div>
                <RecentTransactions />
              </div>

              {/* Account Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Username</span>
                    <span className="font-medium text-gray-900">
                      {user?.username || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">
                      {user?.email || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Login Type</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {user?.login_type || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Account Status</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      <User className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      <TopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
      />
    </>
  );
}
