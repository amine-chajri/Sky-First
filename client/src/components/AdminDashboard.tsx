import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Loader2, X, Check } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api, extractApiError } from "../lib/api";
import type { MenuItem, MenuCategory } from "../types";

const MENU_CATEGORIES: MenuCategory[] = [
  "breakfast",
  "mains",
  "desserts",
  "beverages",
];

interface MenuItemForm {
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image: string;
  tags: string;
  isVegetarian: boolean;
  isChefsSpecial: boolean;
  isAvailable: boolean;
}

async function fetchAllMenuItems(): Promise<MenuItem[]> {
  const { data } = await api.get<{ items: MenuItem[] }>("/menu/all");
  return data.items;
}

async function createMenuItem(payload: MenuItemForm): Promise<MenuItem> {
  const { data } = await api.post<{ item: MenuItem }>("/menu", {
    name: payload.name,
    description: payload.description,
    category: payload.category,
    price: payload.price,
    image: payload.image || undefined,
    tags: payload.tags.split(",").map((t) => t.trim()).filter(Boolean),
    isVegetarian: payload.isVegetarian,
    isChefsSpecial: payload.isChefsSpecial,
    isAvailable: payload.isAvailable,
  });
  return data.item;
}

async function updateMenuItem(
  id: string,
  payload: Partial<MenuItemForm>
): Promise<MenuItem> {
  const { data } = await api.put<{ item: MenuItem }>(`/menu/${id}`, {
    ...payload,
    tags: payload.tags
      ? payload.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
    price: payload.price ?? undefined,
  });
  return data.item;
}

async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(`/menu/${id}`);
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(price);
}

const emptyForm: MenuItemForm = {
  name: "",
  description: "",
  category: "mains",
  price: 0,
  image: "",
  tags: "",
  isVegetarian: false,
  isChefsSpecial: false,
  isAvailable: true,
};

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MenuItemForm, string>>>({});

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-menu-items"],
    queryFn: fetchAllMenuItems,
  });

  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
      closeModal();
    },
    onError: (err) => {
      setFormErrors({ name: extractApiError(err) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MenuItemForm> }) =>
      updateMenuItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
      closeModal();
    },
    onError: (err) => {
      setFormErrors({ name: extractApiError(err) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
    },
    onError: (err) => {
      alert(extractApiError(err));
    },
  });

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        image: item.image,
        tags: item.tags.join(", "),
        isVegetarian: item.isVegetarian,
        isChefsSpecial: item.isChefsSpecial,
        isAvailable: item.isAvailable,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!formData.name.trim()) {
      setFormErrors({ name: "Name is required" });
      return;
    }
    if (!formData.description.trim()) {
      setFormErrors({ description: "Description is required" });
      return;
    }
    if (formData.price <= 0) {
      setFormErrors({ price: "Price must be greater than 0" });
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<MenuCategory, MenuItem[]>);

  return (
    <div className="min-h-screen bg-night-950 pt-16 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-cream">Admin Dashboard</h1>
            <p className="text-cream/60 mt-1">Manage menu items and restaurant settings</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-cream/60 hidden sm:block">
              Signed in as <span className="font-medium text-gold-300">{user?.name}</span>
            </span>
            <button onClick={logout} className="btn-outline">
              Logout
            </button>
            <button onClick={() => openModal()} className="btn-gold">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {MENU_CATEGORIES.map((category) => {
              const categoryItems = groupedItems[category] || [];
              return (
                <section key={category} className="bg-night-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="font-display text-xl font-semibold text-cream">
                      {formatCategory(category)} <span className="text-cream/50 font-normal text-lg">({categoryItems.length})</span>
                    </h2>
                  </div>
                  <div className="divide-y divide-white/5">
                    {categoryItems.length === 0 ? (
                      <div className="p-12 text-center text-cream/40">
                        <p>No items in this category yet.</p>
                        <button
                          onClick={() => openModal()}
                          className="btn-gold mt-4 inline-flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add First Item
                        </button>
                      </div>
                    ) : (
                      categoryItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-night-950 border border-white/10 overflow-hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-cream/30">
                                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-cream truncate">{item.name}</h3>
                              <p className="text-sm text-cream/50 truncate">{item.description}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {item.isVegetarian && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full">
                                    Vegetarian
                                  </span>
                                )}
                                {item.isChefsSpecial && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-gold-500/20 text-gold-300 rounded-full">
                                    Chef's Special
                                  </span>
                                )}
                                {!item.isAvailable && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-300 rounded-full">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 ml-4">
                            <span className="font-display text-lg font-bold text-gold-300 whitespace-nowrap">
                              {formatPrice(item.price)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal(item)}
                                className="p-2 rounded-lg text-cream/50 hover:text-cream hover:bg-white/10 transition-colors"
                                aria-label="Edit item"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                disabled={deleteMutation.isPending}
                                className="p-2 rounded-lg text-cream/50 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                aria-label="Delete item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-night-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="font-display text-xl font-semibold text-cream">
                  {editingItem ? "Edit Menu Item" : "Add Menu Item"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg text-cream/50 hover:text-cream hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-cream/80 mb-2">
                      Name *
                    </label>
                    <input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-night-950 border border-white/10 text-cream placeholder-cream/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent"
                      placeholder="e.g., Grilled Salmon"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-cream/80 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuCategory })}
                      className="w-full px-4 py-3 rounded-lg bg-night-950 border border-white/10 text-cream focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent"
                    >
                      {MENU_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {formatCategory(cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-cream/80 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-night-950 border border-white/10 text-cream placeholder-cream/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent resize-none"
                    placeholder="Delicious grilled salmon with lemon butter sauce..."
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.description}</p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-cream/80 mb-2">
                      Price (MAD) *
                    </label>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg bg-night-950 border border-white/10 text-cream placeholder-cream/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent"
                      placeholder="120"
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-cream/80 mb-2">
                      Image URL
                    </label>
                    <input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-night-950 border border-white/10 text-cream placeholder-cream/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-cream/80 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-night-950 border border-white/10 text-cream placeholder-cream/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent"
                    placeholder="popular, lunch, signature"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian}
                      onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-night-950 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="text-cream/80">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isChefsSpecial}
                      onChange={(e) => setFormData({ ...formData, isChefsSpecial: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-night-950 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="text-cream/80">Chef's Special</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-night-950 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="text-cream/80">Available</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-gold"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      editingItem ? "Update" : "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}