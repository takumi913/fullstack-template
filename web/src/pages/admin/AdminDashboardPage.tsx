import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  Settings,
  Database,
} from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { SEO } from "@/components/SEO";

export default function AdminDashboardPage() {
  const { stats, userGrowth, revenueGrowth, loading, fetchDashboardStats, fetchUserGrowth, fetchRevenueGrowth } =
    useAdminStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchUserGrowth(30);
    fetchRevenueGrowth(30);
  }, [fetchDashboardStats, fetchUserGrowth, fetchRevenueGrowth]);

  const statCards = [
    {
      title: "总用户数",
      value: stats?.total_users ?? 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "今日新增",
      value: stats?.today_new_users ?? 0,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "付费用户",
      value: (stats?.registered_paying_users ?? 0) + (stats?.guest_paying_users ?? 0),
      icon: CreditCard,
      color: "bg-purple-500",
      subtitle: `注册: ${stats?.registered_paying_users ?? 0} / 游客: ${stats?.guest_paying_users ?? 0}`,
    },
    {
      title: "总订单数",
      value: stats?.total_orders ?? 0,
      icon: DollarSign,
      color: "bg-orange-500",
    },
    {
      title: "总收入",
      value: `$${stats?.total_order_amount ?? "0"}`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      title: "今日收入",
      value: `$${stats?.today_revenue ?? "0"}`,
      icon: TrendingUp,
      color: "bg-cyan-500",
    },
  ];

  return (
    <>
      <SEO title="管理后台" description="管理后台仪表板" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            管理后台
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            查看系统统计数据和管理 AI 服务
          </p>
        </div>

        {/* 快捷导航 */}
        <div className="mb-8 flex gap-4">
          <Link
            to="/admin/providers"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Settings className="h-5 w-5" />
            <span>Provider 管理</span>
          </Link>
          <Link
            to="/admin/models"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Database className="h-5 w-5" />
            <span>Model 管理</span>
          </Link>
        </div>

        {/* 统计卡片 */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                    {card.subtitle && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`rounded-full ${card.color} p-3`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 增长趋势 */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* 用户增长 */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              用户增长趋势 (近30天)
            </h2>
            {userGrowth.length > 0 ? (
              <div className="space-y-2">
                {userGrowth.slice(-7).map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.date}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(item.count * 10, 100)}px` }}
                      ></div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
            )}
          </div>

          {/* 收入增长 */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              收入趋势 (近30天)
            </h2>
            {revenueGrowth.length > 0 ? (
              <div className="space-y-2">
                {revenueGrowth.slice(-7).map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.date}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {item.count} 笔
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        ${item.value ?? "0"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
