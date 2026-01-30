import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout, EditorLayout } from "../components/layout";
import { useAuthStore } from "../store/authStore";

// 页面组件
import HomePage from "../pages/HomePage";
import RemoveWatermarkPage from "../pages/RemoveWatermarkPage";
import TranslateImagePage from "../pages/TranslateImagePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import PrivacyPage from "../pages/PrivacyPage";
import TermsPage from "../pages/TermsPage";
import CookiesPage from "../pages/CookiesPage";
import BlogPage from "../pages/BlogPage";
import BlogPostPage from "../pages/BlogPostPage";

// Admin 页面组件
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminProvidersPage from "../pages/admin/AdminProvidersPage";
import AdminModelsPage from "../pages/admin/AdminModelsPage";

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 管理员路由组件
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// 公开路由组件（已登录用户重定向到仪表板）
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// 路由配置
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // 首页
      {
        index: true,
        element: <HomePage />,
      },

      // 核心工具页（扁平化 URL）
      {
        path: "remove-watermark",
        element: <RemoveWatermarkPage />,
      },
      {
        path: "translate-image",
        element: <TranslateImagePage />,
      },

      // Blog Pages
      {
        path: "blog",
        element: <BlogPage />,
      },
      {
        path: "blog/:slug",
        element: <BlogPostPage />,
      },

      // 信息页面
      {
        path: "pricing",
        element: <div>Pricing Page - Coming Soon</div>,
      },
      {
        path: "faq",
        element: <div>FAQ Page - Coming Soon</div>,
      },
      {
        path: "changelog",
        element: <div>Changelog Page - Coming Soon</div>,
      },

      // 法律页面
      {
        path: "legal/privacy-policy",
        element: <PrivacyPage />,
      },
      {
        path: "legal/terms",
        element: <TermsPage />,
      },
      {
        path: "legal/refund-policy",
        element: <CookiesPage />,
      },
      // 兼容旧法律页面路径
      {
        path: "privacy",
        element: <Navigate to="/legal/privacy-policy" replace />,
      },
      {
        path: "terms",
        element: <Navigate to="/legal/terms" replace />,
      },
      {
        path: "cookies",
        element: <Navigate to="/legal/refund-policy" replace />,
      },

      // 用户相关
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },

      // 管理员路由
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/providers",
        element: (
          <AdminRoute>
            <AdminProvidersPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/models",
        element: (
          <AdminRoute>
            <AdminModelsPage />
          </AdminRoute>
        ),
      },
    ],
  },
  // 编辑器布局 - 只有 Header，没有 Footer
  {
    path: "/",
    element: <EditorLayout />,
    children: [],
  },
]);
