import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe, type AuthUser } from "../lib/auth";
import { pdfUrl } from "../lib/reportLanguage";
import {
  ButtonContent,
  PageLoader,
  SectionLoader,
  Spinner,
} from "../components/Spinner";

type Scope = "individual" | "shared";

type Message = {
  id: number;
  subject: string | null;
  body: string | null;
  report_id: number | null;
  report_title: string | null;
  created_at: string;
  sender_id: number | null;
  sender_name: string | null;
  sender_role: string | null;
  is_read: boolean;
};

type Recipient = {
  id: number;
  full_name: string;
  email: string;
  role: string;
};

type Report = {
  id: number;
  title: string;
};

const SHARED_ROLES = ["admin", "teacher", "social_relations", "accountant"];

export default function Inbox() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { i18n } = useTranslation();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [scope, setScope] = useState<Scope>("individual");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);

  const [composing, setComposing] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [reportId, setReportId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const canUseShared = useMemo(
    () => (me ? SHARED_ROLES.includes(me.role) : false),
    [me]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await fetchMe();
      if (cancelled) return;
      if (!user) return navigate("/sign-in");
      setMe(user);

      const [usersRes, reportsRes] = await Promise.all([
        fetch(`${API_URL}/inbox/users`, { credentials: "include" }),
        user.role === "teacher"
          ? fetch(`${API_URL}/teachers/reports`, { credentials: "include" })
          : Promise.resolve(null),
      ]);
      if (usersRes.ok) {
        const d = await usersRes.json();
        if (!cancelled) setRecipients(d.users || []);
      }
      if (reportsRes && reportsRes.ok) {
        const d = await reportsRes.json();
        if (!cancelled) setMyReports(d.reports || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    const recipient = params.get("recipientId");
    if (!recipient) return;
    setScope("individual");
    setComposing(true);
    setRecipientId(recipient);
    setSubject(params.get("subject") || "");
  }, [params]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Load messages whenever scope or search changes
  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    (async () => {
      setRefreshing(true);
      try {
        const url = new URL(`${API_URL}/inbox/${scope}`);
        if (debouncedSearch) url.searchParams.set("q", debouncedSearch);
        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setMessages(data.messages || []);
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [me, scope, debouncedSearch]);

  async function openMessage(msg: Message) {
    setSelected(msg);
    if (!msg.is_read) {
      await fetch(`${API_URL}/inbox/messages/${msg.id}/read`, {
        method: "POST",
        credentials: "include",
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setSendError(null);
    setSending(true);
    try {
      const url =
        scope === "individual"
          ? `${API_URL}/inbox/individual/messages`
          : `${API_URL}/inbox/shared/messages`;
      const payload: Record<string, unknown> = {
        subject: subject || undefined,
        body: bodyText || undefined,
        reportId: reportId ? Number(reportId) : undefined,
      };
      if (scope === "individual") {
        if (!recipientId) {
          setSendError("Choose a recipient.");
          return;
        }
        payload.recipientUserId = Number(recipientId);
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendError(
          data?.errors?.[0]?.msg || data?.message || "Could not send"
        );
        return;
      }
      setComposing(false);
      setSubject("");
      setBodyText("");
      setReportId("");
      setRecipientId("");
      // Refresh list if we sent to shared, the message will appear there.
      // For individual messages we just close the composer (the recipient sees it).
      if (scope === "shared") setDebouncedSearch((s) => s);
    } finally {
      setSending(false);
    }
  }

  async function downloadAttachedReport(rid: number) {
    const res = await fetch(pdfUrl(API_URL, rid, i18n.language), {
      credentials: "include",
    });
    if (!res.ok) {
      alert("You don't have access to download this report.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${rid}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageLoader label="Loading inbox..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <div role="tablist" className="tabs tabs-boxed">
            <button
              type="button"
              role="tab"
              className={`tab ${scope === "individual" ? "tab-active" : ""}`}
              onClick={() => {
                setScope("individual");
                setSelected(null);
              }}
            >
              Individual
            </button>
            {canUseShared && (
              <button
                type="button"
                role="tab"
                className={`tab ${scope === "shared" ? "tab-active" : ""}`}
                onClick={() => {
                  setScope("shared");
                  setSelected(null);
                }}
              >
                Shared
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              className="input input-bordered input-sm w-64"
              type="search"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {refreshing && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <Spinner size="xs" />
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setComposing((v) => !v);
              setSendError(null);
            }}
          >
            {composing ? "Cancel" : "New message"}
          </button>
        </div>
      </div>

      {composing && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              New {scope === "shared" ? "shared" : "individual"} message
            </h2>
            {sendError && (
              <div className="alert alert-error">
                <span>{sendError}</span>
              </div>
            )}
            <form className="grid gap-3 md:grid-cols-2" onSubmit={sendMessage}>
              {scope === "individual" && (
                <label className="form-control md:col-span-2">
                  <div className="label">
                    <span className="label-text">Recipient</span>
                  </div>
                  <select
                    className="select select-bordered"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    required
                  >
                    <option value="">Select user...</option>
                    {recipients.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role}) — {u.email}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="form-control md:col-span-2">
                <div className="label">
                  <span className="label-text">Subject</span>
                </div>
                <input
                  className="input input-bordered"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </label>

              <label className="form-control md:col-span-2">
                <div className="label">
                  <span className="label-text">Message</span>
                </div>
                <textarea
                  className="textarea textarea-bordered min-h-32"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                />
              </label>

              {me?.role === "teacher" && myReports.length > 0 && (
                <label className="form-control md:col-span-2">
                  <div className="label">
                    <span className="label-text">Attach a report</span>
                  </div>
                  <select
                    className="select select-bordered"
                    value={reportId}
                    onChange={(e) => setReportId(e.target.value)}
                  >
                    <option value="">No attachment</option>
                    {myReports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <button
                type="submit"
                className="btn btn-primary md:col-span-2"
                disabled={sending}
              >
                <ButtonContent loading={sending} loadingLabel="Sending...">
                  Send
                </ButtonContent>
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 card bg-base-100 shadow-xl">
          <div className="card-body p-0">
            {refreshing && messages.length === 0 ? (
              <SectionLoader label="Loading messages..." />
            ) : messages.length === 0 ? (
              <p className="p-4 text-base-content/70">No messages.</p>
            ) : (
              <ul className="divide-y divide-base-300">
                {messages.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => openMessage(m)}
                      className={`w-full text-left p-3 hover:bg-base-200 ${
                        selected?.id === m.id ? "bg-base-200" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate ${
                            !m.is_read ? "font-semibold" : ""
                          }`}
                        >
                          {m.subject || "(no subject)"}
                        </span>
                        {!m.is_read && (
                          <span className="badge badge-primary badge-sm">
                            new
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-base-content/60 mt-1 truncate">
                        {m.sender_name || "system"}
                        {m.sender_role && ` • ${m.sender_role}`} •{" "}
                        {new Date(m.created_at).toLocaleString()}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="md:col-span-2 card bg-base-100 shadow-xl">
          <div className="card-body">
            {!selected ? (
              <p className="text-base-content/70">
                Select a message to read.
              </p>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">
                  {selected.subject || "(no subject)"}
                </h2>
                <div className="text-sm text-base-content/70">
                  From {selected.sender_name || "system"}
                  {selected.sender_role && ` (${selected.sender_role})`} •{" "}
                  {new Date(selected.created_at).toLocaleString()}
                </div>
                {selected.body && (
                  <p className="whitespace-pre-wrap">{selected.body}</p>
                )}
                {selected.report_id && (
                  <div className="mt-2">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => downloadAttachedReport(selected.report_id!)}
                    >
                      Download attached report
                      {selected.report_title
                        ? ` — ${selected.report_title}`
                        : ""}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm">
        <Link className="link" to="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}
