import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Star,
} from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { SEO } from "@/components/SEO";
import type {
  AIModel,
  CreateModelRequest,
  UpdateModelRequest,
} from "@/api/admin";

export default function AdminModelsPage() {
  const {
    providers,
    models,
    loading,
    fetchProviders,
    fetchModels,
    createModel,
    updateModel,
    deleteModel,
    toggleModel,
  } = useAdminStore();

  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [formData, setFormData] = useState<CreateModelRequest>({
    provider_id: "",
    name: "",
    display_name: "",
    credits_per_use: 1,
    is_enabled: true,
    is_default: false,
    config: "",
  });

  useEffect(() => {
    fetchProviders();
    fetchModels();
  }, [fetchProviders, fetchModels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModel) {
        const updateData: UpdateModelRequest = {
          provider_id: formData.provider_id,
          name: formData.name,
          display_name: formData.display_name,
          credits_per_use: formData.credits_per_use,
          is_enabled: formData.is_enabled,
          is_default: formData.is_default,
          config: formData.config,
        };
        await updateModel(editingModel.id, updateData);
      } else {
        await createModel(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleEdit = (model: AIModel) => {
    setEditingModel(model);
    setFormData({
      provider_id: model.provider_id,
      name: model.name,
      display_name: model.display_name,
      credits_per_use: model.credits_per_use,
      is_enabled: model.is_enabled,
      is_default: model.is_default,
      config: model.config,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个 Model 吗？")) return;
    try {
      await deleteModel(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleModel(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "切换失败");
    }
  };

  const resetForm = () => {
    setEditingModel(null);
    setFormData({
      provider_id: providers[0]?.id || "",
      name: "",
      display_name: "",
      credits_per_use: 1,
      is_enabled: true,
      is_default: false,
      config: "",
    });
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.display_name || providerId;
  };

  return (
    <>
      <SEO title="Model 管理" description="管理 AI Model" />
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
                Model 管理
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                管理 AI 模型
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
            添加 Model
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
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                    积分消耗
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                    默认
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
                {models.map((model) => (
                  <tr key={model.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {model.display_name}
                        </p>
                        <p className="text-sm text-gray-500">{model.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {model.provider?.display_name ||
                        getProviderName(model.provider_id)}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {model.credits_per_use}
                    </td>
                    <td className="px-6 py-4">
                      {model.is_default && (
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(model.id)}
                        className="flex items-center gap-1"
                      >
                        {model.is_enabled ? (
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
                          onClick={() => handleEdit(model)}
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-5 w-5 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(model.id)}
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {models.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      暂无 Model
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
                {editingModel ? "编辑 Model" : "添加 Model"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Provider
                  </label>
                  <select
                    value={formData.provider_id}
                    onChange={(e) =>
                      setFormData({ ...formData, provider_id: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    required
                  >
                    <option value="">选择 Provider</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    模型标识符
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="gpt-4, claude-3..."
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
                    placeholder="GPT-4, Claude 3..."
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    每次消耗积分
                  </label>
                  <input
                    type="number"
                    value={formData.credits_per_use}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credits_per_use: parseInt(e.target.value) || 1,
                      })
                    }
                    min={0}
                    className="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="model_is_enabled"
                      checked={formData.is_enabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_enabled: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded"
                    />
                    <label
                      htmlFor="model_is_enabled"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      启用
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="model_is_default"
                      checked={formData.is_default}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_default: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded"
                    />
                    <label
                      htmlFor="model_is_default"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      设为默认
                    </label>
                  </div>
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
                    {editingModel ? "保存" : "创建"}
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
