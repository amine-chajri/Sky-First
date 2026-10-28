import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarDays, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { api, extractApiError } from "../lib/api";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SHIFT_STATUS_OPTIONS = [
  { value: "on-shift", label: "On Shift" },
  { value: "off-shift", label: "Off Shift" },
  { value: "day-off", label: "Day Off" },
];

const SHIFT_STATUS_LABELS = SHIFT_STATUS_OPTIONS.reduce(
  (labels, option) => ({ ...labels, [option.value]: option.label }),
  {}
);

const SHIFT_STATUS_STYLES = {
  "on-shift": "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  "off-shift": "border-amber-400/30 bg-amber-500/15 text-amber-300",
  "day-off": "border-blue-400/30 bg-blue-500/15 text-blue-300",
};

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  shiftStatus: "off-shift",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

async function fetchWaiters() {
  const { data } = await api.get("/users", { params: { role: "waiter" } });
  return data.users;
}

async function createWaiterAccount(payload) {
  const { data } = await api.post("/users", { ...payload, role: "waiter" });
  return data.user;
}

async function updateWaiterAccount(id, payload) {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data.user;
}

async function deleteWaiterAccount(id) {
  await api.delete(`/users/${id}`);
}

function formatCreatedAt(value) {
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function WaiterAccountsTable() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { data: waiters = [], isLoading } = useQuery({
    queryKey: ["admin-waiters"],
    queryFn: fetchWaiters,
  });

  const invalidateWaiters = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-waiters"] });
    queryClient.invalidateQueries({ queryKey: ["active-floor-waiters"] });
  };

  const createMutation = useMutation({
    mutationFn: createWaiterAccount,
    onSuccess: () => {
      invalidateWaiters();
      closeDialog();
    },
    onError: (err) => setFormErrors({ submit: extractApiError(err) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateWaiterAccount(id, payload),
    onSuccess: () => {
      invalidateWaiters();
      closeDialog();
    },
    onError: (err) => setFormErrors({ submit: extractApiError(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWaiterAccount,
    onSuccess: (_data, id) => {
      setSelectedIds((ids) => ids.filter((selectedId) => selectedId !== id));
      invalidateWaiters();
    },
    onError: (err) => alert(extractApiError(err)),
  });

  const openDialog = (waiter = null) => {
    setEditingWaiter(waiter);
    setForm(
      waiter
        ? {
            name: waiter.name,
            email: waiter.email,
            password: "",
            shiftStatus: waiter.shiftStatus || "off-shift",
          }
        : EMPTY_FORM
    );
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingWaiter(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const handleDialogChange = (open) => {
    if (!open) closeDialog();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) errors.name = "Name is required";
    if (!email) {
      errors.email = "Email is required";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "Enter a valid email address";
    }
    if (!editingWaiter && !form.password) {
      errors.password = "Password is required";
    } else if (form.password && form.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (!SHIFT_STATUS_LABELS[form.shiftStatus]) {
      errors.shiftStatus = "Choose a shift status";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      name,
      email,
      shiftStatus: form.shiftStatus,
    };
    if (form.password) payload.password = form.password;

    if (editingWaiter) {
      updateMutation.mutate({ id: editingWaiter.id || editingWaiter._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (waiter) => {
    if (window.confirm(`Delete ${waiter.name}'s waiter account? This cannot be undone.`)) {
      deleteMutation.mutate(waiter.id || waiter._id);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const label = selectedIds.length === 1 ? "account" : "accounts";
    if (!window.confirm(`Delete ${selectedIds.length} selected waiter ${label}? This cannot be undone.`)) {
      return;
    }
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteWaiterAccount(id)));
    } catch (err) {
      alert(extractApiError(err));
    } finally {
      setSelectedIds([]);
      invalidateWaiters();
      setIsBulkDeleting(false);
    }
  };

  const allSelected = waiters.length > 0 && waiters.every((waiter) => selectedIds.includes(waiter.id));

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : waiters.map((waiter) => waiter.id));
  };

  const toggleOne = (id) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]));
  };

  const onShiftCount = waiters.filter((waiter) => waiter.shiftStatus === "on-shift").length;
  const dayOffCount = waiters.filter((waiter) => waiter.shiftStatus === "day-off").length;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-night-900/80 pb-3 backdrop-blur-xl" aria-label="Waiter accounts">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Team</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-cream">Waiter accounts</h2>
          <p className="mt-1 text-sm text-cream/50">Create logins and manage who is on shift.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete selected ({selectedIds.length})
            </button>
          )}
          <button type="button" onClick={() => openDialog()} className="btn-gold !px-4 !py-2.5">
            <Plus className="h-4 w-4" />
            Add Waiter
          </button>
        </div>
      </div>

      <div className="max-h-[440px] overflow-y-auto [&_[data-slot=table-container]]:overflow-visible">
        <Table className="text-cream">
          <TableHeader className="sticky top-0 z-10 bg-night-900 shadow-sm [&_th]:text-cream/60">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all waiters"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="[&_tr]:border-white/5">
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-gold-400" />
                </TableCell>
              </TableRow>
            ) : waiters.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-12 text-center text-cream/50">
                  No waiter accounts yet. Add the first one to get started.
                </TableCell>
              </TableRow>
            ) : (
              waiters.map((waiter) => {
                const isSelected = selectedIds.includes(waiter.id);
                const status = waiter.shiftStatus || "off-shift";
                return (
                  <TableRow
                    key={waiter.id}
                    aria-selected={isSelected}
                    className={
                      isSelected
                        ? "bg-gold-400 text-night-950 hover:bg-gold-300"
                        : "hover:bg-white/5"
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(waiter.id)}
                        aria-label={`Select ${waiter.name}`}
                        className={isSelected ? "border-night-950/40" : undefined}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{waiter.name}</TableCell>
                    <TableCell className={isSelected ? "text-night-950/75" : "text-cream/70"}>{waiter.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isSelected
                            ? "border-night-950/30 bg-night-950/15 text-night-950"
                            : SHIFT_STATUS_STYLES[status] || SHIFT_STATUS_STYLES["off-shift"]
                        }
                      >
                        {SHIFT_STATUS_LABELS[status] || "Off Shift"}
                      </Badge>
                    </TableCell>
                    <TableCell className={isSelected ? "text-night-950/75" : "text-cream/60"}>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatCreatedAt(waiter.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDialog(waiter)}
                          className={
                            isSelected
                              ? "rounded-lg p-2 text-night-950/70 transition-colors hover:bg-night-950/10 hover:text-night-950"
                              : "rounded-lg p-2 text-cream/50 transition-colors hover:bg-white/10 hover:text-cream"
                          }
                          aria-label={`Edit ${waiter.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(waiter)}
                          disabled={deleteMutation.isPending}
                          className={
                            isSelected
                              ? "rounded-lg p-2 text-night-950/70 transition-colors hover:bg-red-500/20 hover:text-red-950 disabled:opacity-50"
                              : "rounded-lg p-2 text-cream/50 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          }
                          aria-label={`Delete ${waiter.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          <TableFooter className="sticky bottom-0 z-10 border-white/10 bg-night-900 [&_td]:text-cream/60">
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={2} className="pt-4 pb-2 font-medium">
                Total waiters: {waiters.length}
              </TableCell>
              <TableCell className="pt-4 pb-2">{onShiftCount} on shift</TableCell>
              <TableCell className="pt-4 pb-2">{dayOffCount} day off</TableCell>
              <TableCell colSpan={2} className="pt-4 pb-2 text-right">
                {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Ready for service"}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="border border-white/10 bg-night-900 text-cream sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-cream">
              {editingWaiter ? "Edit waiter account" : "Add waiter account"}
            </DialogTitle>
            <DialogDescription className="text-cream/60">
              {editingWaiter
                ? "Update the account details, password or shift status."
                : "Create a login for a new waiter. They can sign in right away."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.submit && (
              <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {formErrors.submit}
              </p>
            )}

            <div>
              <label htmlFor="waiter-name" className="mb-2 block text-sm font-medium text-cream/80">
                Full name *
              </label>
              <input
                id="waiter-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-night-950 px-4 py-3 text-cream placeholder-cream/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                placeholder="e.g., Sara Amrani"
                autoComplete="name"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="waiter-email" className="mb-2 block text-sm font-medium text-cream/80">
                Email *
              </label>
              <input
                id="waiter-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-night-950 px-4 py-3 text-cream placeholder-cream/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                placeholder="waiter@skyfirst.ma"
                autoComplete="email"
              />
              {formErrors.email && <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="waiter-password" className="mb-2 block text-sm font-medium text-cream/80">
                Password {editingWaiter ? "(leave blank to keep current)" : "*"}
              </label>
              <input
                id="waiter-password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-night-950 px-4 py-3 text-cream placeholder-cream/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                placeholder={editingWaiter ? "••••••••" : "At least 6 characters"}
                autoComplete="new-password"
              />
              {formErrors.password && <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="waiter-status" className="mb-2 block text-sm font-medium text-cream/80">
                Shift status *
              </label>
              <select
                id="waiter-status"
                value={form.shiftStatus}
                onChange={(event) => setForm({ ...form, shiftStatus: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-night-950 px-4 py-3 text-cream focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              >
                {SHIFT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.shiftStatus && <p className="mt-1 text-sm text-red-400">{formErrors.shiftStatus}</p>}
            </div>

            <DialogFooter className="-mx-4 -mb-4 border-white/10 bg-transparent">
              <button type="button" onClick={closeDialog} className="btn-outline !px-5 !py-2.5">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="btn-gold !px-5 !py-2.5">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : editingWaiter ? (
                  "Save changes"
                ) : (
                  "Create waiter"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
