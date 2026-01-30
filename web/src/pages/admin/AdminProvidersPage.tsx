import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Key,
} from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { SEO } from "@/components/SEO";
import type {
  AIProvider,
  CreateProviderRequest,
  UpdateProviderRequest,
  ProviderType,
} from "@/api/admin";

export default function AdminProvidersPage() {
  const { providers, loading, fetchProviders, createProvider, updateProvider, deleteProvider, toggleProvider } =
    useAdminStore();

  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [formData, setFormData] = useState<CreateProviderRequest>({
    name: "",
    display_name: "",
    type: "image",
    base_url: "",
    api_key: "",
    is_enabled: true,
    priority: 0,
    config: "",
  });

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProvider) {
        const updateData: UpdateProviderRequest = {
          display_name: formData.display_name,
          type: formData.type,
          base_url: formData.base_url,
          is_enabled: formData.is_enabled,
          priority: formData.priority,
          config: formData.config,
        };
        if (formData.api_key) {
          updateData.api_key = formData.api_key;
        }
        await updateProvider(editingProvider.id, updateData);
      } else {
        await createProvider(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleEdit = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      display_name: provider.display_name,
      type: provider.type,
      base_url: provider.base_url,
      api_key: "",
      is_enabled: provider.is_enabled,
      priority: provider.priority,
      config: provider.config,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个 Provider 吗？")) return;
    try {
      await deleteProvider(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleProvider(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "切换失败");
    }
  };

  const resetForm = () => {
    setEditingProvider(null);
    setFormData({
      name: "",
      display_name: "",
      type: "image",
      base_url: "",
      api_key: "",
      is_enabled: true,
      priority: 0,
      config: "",
    });
  };

  return (
    <>
      <SEO title="Provider 管理" description="管理 AI Provider" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Provider 管理
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                管理 AI 服务提供商
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            添加 Provider
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                    名称
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                    优先级
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                    状态
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-300">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {providers.map((provider) => (
                  <tr key={provider.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {provider.display_name}
                        </p>
                        <p className="text-sm text-gray-500">{provider.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          provider.type === "llm"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {provider.type === "llm" ? "LLM" : "Image"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {provider.has_api_key ? (
                        <Key className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {provider.priority}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(provider.id)}
                        className="flex items-center gap-1"
                      >
                        {provider.is_enabled ? (
                          <>
                            <ToggleRight className="h-6 w-6 text-green-500" />
                            <span className="text-sm text-green-600">启用</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-6 w-6 text-gray-400" />
                            <span className="text-sm text-gray-500">禁用</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(provider)}
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-5 w-5 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(provider.id)}
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      暂无 Provider
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                {editingProvider ? "编辑 Provider" : "添加 Provider"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    标识符
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!!editingProvider}
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
                    placeholder="openai, anthropic, fal..."
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    显示名称
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="OpenAI, Anthropic..."
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as ProviderType,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="image">Image</option>
                    <option value="llm">LLM</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={formData.base_url}
                    onChange={(e) =>
                      setFormData({ ...formData, base_url: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="https://api.openai.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    API Key {editingProvider && "(留空保持不变)"}
                  </label>
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) =>
                      setFormData({ ...formData, api_key: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    优先级
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_enabled"
                    checked={formData.is_enabled}
                    onChange={(e) =>
                      setFormData({ ...formData, is_enabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded"
                  />
                  <label
                    htmlFor="is_enabled"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    启用
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    {editingProvider ? "保存" : "创建"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
