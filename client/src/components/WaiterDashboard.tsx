import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Loader2, Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, MessageSquare, MoreVertical } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api, extractApiError } from "../lib/api";

interface Reservation {
  _id: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingPreference: string;
  name: string;
  phone: string;
  email: string;
  specialRequests: string;
  status: "confirmed" | "cancelled" | "completed";
  confirmationCode: string;
  createdAt: string;
}

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
}

const SEATING_LABELS: Record<string, string> = {
  "panoramic-rooftop": "Panoramic Rooftop",
  "indoor-lounge": "Indoor Lounge",
  "standard-dining": "Standard Dining",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-400/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-400/30",
};

const CONTACT_STATUS_LABELS: Record<string, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

const CONTACT_STATUS_COLORS: Record<string, string> = {
  new: "bg-gold-500/20 text-gold-300 border-gold-400/30",
  read: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  replied: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
};

async function fetchReservations(params?: { date?: string; status?: string }): Promise<Reservation[]> {
  const searchParams = new URLSearchParams();
  if (params?.date) searchParams.set("date", params.date);
  if (params?.status) searchParams.set("status", params.status);
  const { data } = await api.get<{ reservations: Reservation[] }>(`/reservations?${searchParams}`);
  return data.reservations;
}

async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data } = await api.get<{ messages: ContactMessage[] }>("/contact");
  return data.messages;
}

async function updateReservationStatus(id: string, status: string): Promise<Reservation> {
  const { data } = await api.patch<{ reservation: Reservation }>(`/reservations/${id}/status`, { status });
  return data.reservation;
}

async function updateContactStatus(id: string, status: string): Promise<ContactMessage> {
  const { data } = await api.patch<{ message: ContactMessage }>(`/contact/${id}/status`, { status });
  return data.message;
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE, MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export function WaiterDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reservations" | "messages">("reservations");

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["waiter-reservations", selectedDate, selectedStatus],
    queryFn: () =>
      fetchReservations({
        date: selectedDate,
        status: selectedStatus === "all" ? undefined : selectedStatus,
      }),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["waiter-messages"],
    queryFn: fetchContactMessages,
  });

  const updateReservationMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiter-reservations"] });
    },
    onError: (err) => {
      alert(extractApiError(err));
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateContactStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiter-messages"] });
    },
    onError: (err) => {
      alert(extractApiError(err));
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    if (activeTab === "reservations") {
      updateReservationMutation.mutate({ id, status: newStatus });
    } else {
      updateContactMutation.mutate({ id, status: newStatus });
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-night-950 pt-16 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-cream">Waiter Dashboard</h1>
            <p className="text-cream/60 mt-1">Manage reservations and customer messages</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-cream/60 hidden sm:block">
              Signed in as <span className="font-medium text-gold-300">{user?.name}</span>
            </span>
            <button onClick={logout} className="btn-outline">
              Logout
            </button>
          </div>
        </div>

        <div className="bg-night-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "reservations"
                  ? "text-gold-300 border-b-2 border-gold-400 bg-white/5"
                  : "text-cream/50 hover:text-cream"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservations
              </span>
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "messages"
                  ? "text-gold-300 border-b-2 border-gold-400 bg-white/5"
                  : "text-cream/50 hover:text-cream"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === "reservations" ? (
              <>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-cream/50" />
                    <label htmlFor="date-filter" className="text-sm text-cream/60">Date:</label>
                    <input
                      id="date-filter"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-night-950 border border-white/10 text-cream focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-sm text-cream/60">Status:</label>
                    <select
                      id="status-filter"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-night-950 border border-white/10 text-cream focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent"
                    >
                      <option value="all">All</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex-1" />
                  <div className="text-sm text-cream/50">
                    {selectedDate === today ? "Today" : formatDate(selectedDate)} · {reservations.length} reservation{reservations.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {reservationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="text-center py-12 text-cream/50">
                    <Calendar className="mx-auto h-12 w-12 text-cream/20 mb-4" />
                    <p className="text-lg">No reservations for this date</p>
                    <p className="text-sm mt-1">Reservations will appear here when customers book</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <ReservationCard
                        key={reservation._id}
                        reservation={reservation}
                        isExpanded={expandedReservation === reservation._id}
                        onToggle={() =>
                          setExpandedReservation(expandedReservation === reservation._id ? null : reservation._id)
                        }
                        onStatusChange={handleStatusChange}
                        isUpdating={updateReservationMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-cream/50">
                    <MessageSquare className="mx-auto h-12 w-12 text-cream/20 mb-4" />
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm mt-1">Customer inquiries will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageCard
                        key={message._id}
                        message={message}
                        isExpanded={expandedMessage === message._id}
                        onToggle={() =>
                          setExpandedMessage(expandedMessage === message._id ? null : message._id)
                        }
                        onStatusChange={handleStatusChange}
                        isUpdating={updateContactMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReservationCardProps {
  reservation: Reservation;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: string) => void;
  isUpdating: boolean;
}

function ReservationCard({
  reservation,
  isExpanded,
  onToggle,
  onStatusChange,
  isUpdating,
}: ReservationCardProps) {
  return (
    <div className="bg-night-950 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-500/15 text-gold-300">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium text-cream">{reservation.name}</h3>
            <p className="text-sm text-cream/50">Code: {reservation.confirmationCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[reservation.status]}`}
          >
            {STATUS_LABELS[reservation.status]}
          </span>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-cream/50" /> : <ChevronDown className="h-5 w-5 text-cream/50" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 bg-night-950/50 rounded-lg">
              <Calendar className="h-5 w-5 text-gold-400" />
              <div>
                <p className="text-xs text-cream/50">Date</p>
                <p className="font-medium text-cream">{formatDate(reservation.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-night-950/50 rounded-lg">
              <Clock className="h-5 w-5 text-gold-400" />
              <div>
                <p className="text-xs text-cream/50">Time</p>
                <p className="font-medium text-cream">{formatTime(reservation.timeSlot)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-night-950/50 rounded-lg">
              <Users className="h-5 w-5 text-gold-400" />
              <div>
                <p className="text-xs text-cream/50">Guests</p>
                <p className="font-medium text-cream">{reservation.guests}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-night-950/50 rounded-lg">
              <MapPin className="h-5 w-5 text-gold-400" />
              <div>
                <p className="text-xs text-cream/50">Seating</p>
                <p className="font-medium text-cream">{SEATING_LABELS[reservation.seatingPreference]}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-cream/50 mb-1">Phone</p>
              <p className="text-cream">{reservation.phone}</p>
            </div>
            <div>
              <p className="text-xs text-cream/50 mb-1">Email</p>
              <p className="text-cream">{reservation.email}</p>
            </div>
          </div>

          {reservation.specialRequests && (
            <div>
              <p className="text-xs text-cream/50 mb-1">Special Requests</p>
              <p className="text-cream bg-night-950/50 p-3 rounded-lg">{reservation.specialRequests}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <p className="text-sm text-cream/50">Update status:</p>
            <div className="flex gap-2">
              {(["confirmed", "completed", "cancelled"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(reservation._id, status)}
                  disabled={isUpdating || reservation.status === status}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    reservation.status === status
                      ? "bg-gold-500/20 text-gold-300 border border-gold-400/30 cursor-default"
                      : "bg-white/5 text-cream/70 hover:bg-white/10"
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageCardProps {
  message: ContactMessage;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: string) => void;
  isUpdating: boolean;
}

function MessageCard({
  message,
  isExpanded,
  onToggle,
  onStatusChange,
  isUpdating,
}: MessageCardProps) {
  return (
    <div className="bg-night-950 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-cream truncate">{message.name}</h3>
            <p className="text-sm text-cream/50 truncate">{message.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${CONTACT_STATUS_COLORS[message.status]}`}
          >
            {CONTACT_STATUS_LABELS[message.status]}
          </span>
          <span className="text-xs text-cream/40 hidden sm:block">
            {format(parseISO(message.createdAt), "MMM d, HH:mm")}
          </span>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-cream/50" /> : <ChevronDown className="h-5 w-5 text-cream/50" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-cream/50 mb-1">Email</p>
              <p className="text-cream">{message.email}</p>
            </div>
            {message.phone && (
              <div>
                <p className="text-xs text-cream/50 mb-1">Phone</p>
                <p className="text-cream">{message.phone}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-cream/50 mb-1">Message</p>
            <p className="text-cream bg-night-950/50 p-3 rounded-lg whitespace-pre-wrap">{message.message}</p>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <p className="text-sm text-cream/50">Update status:</p>
            <div className="flex gap-2">
              {(["new", "read", "replied"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(message._id, status)}
                  disabled={isUpdating || message.status === status}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    message.status === status
                      ? "bg-gold-500/20 text-gold-300 border border-gold-400/30 cursor-default"
                      : "bg-white/5 text-cream/70 hover:bg-white/10"
                  }`}
                >
                  {CONTACT_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}