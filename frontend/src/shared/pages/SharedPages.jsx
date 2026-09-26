import { useEffect, useState } from "react";
import { MoreHorizontal, Paperclip, Send, Smile } from "lucide-react";
import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchBox,
  Spinner,
} from "../components/common/UI";
import { countUnread, isUnread, messageService } from "./messageService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "SN";
const otherParticipant = (conversation, userId) =>
  conversation.participants.find((p) => p.id !== userId) || conversation.participants[0];
const timeOf = (value) => (value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");

export function Messages() {
  const { user } = useAuth();
  const { show } = useToast();
  const [conversations, setConversations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const requested = Number(new URLSearchParams(window.location.search).get("conversation")) || null;
    messageService
      .getAll()
      .then((data) => {
        setConversations(data);
        setActiveId(data.some((c) => c.id === requested) ? requested : data[0]?.id ?? null);
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeId == null) return;
    const conversation = conversations?.find((c) => c.id === activeId);
    if (!conversation || !countUnread([conversation], user?.id)) return;
    messageService.markRead(activeId).then(() => {
      setConversations((list) =>
        list.map((c) =>
          c.id === activeId
            ? { ...c, messages: c.messages.map((m) => (isUnread(m, user?.id) ? { ...m, read_at: new Date().toISOString() } : m)) }
            : c
        )
      );
    }).catch(() => {});
  }, [activeId, conversations]);

  const active = conversations?.find((c) => c.id === activeId);
  const filtered = (conversations || []).filter((c) =>
    (otherParticipant(c, user?.id)?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active || sending) return;
    setSending(true);
    try {
      const message = await messageService.send(active.id, { body: text });
      setConversations((list) =>
        list.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, message] } : c))
      );
      setText("");
    } catch {
      show("Your message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader title="Messages" description="Keep hiring conversations clear and connected." />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState />
      ) : !conversations?.length ? (
        <div className="panel">
          <EmptyState
            title="No conversations yet"
            description="A conversation opens automatically once you apply to a job."
          />
        </div>
      ) : (
        <div className="messages-layout">
          <aside>
            <SearchBox value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations" />
            {filtered.map((c) => {
              const person = otherParticipant(c, user?.id);
              const last = c.messages[c.messages.length - 1];
              const unread = countUnread([c], user?.id);
              return (
                <button className={activeId === c.id ? "active" : ""} onClick={() => setActiveId(c.id)} key={c.id}>
                  <Avatar initials={initialsOf(person?.name)} />
                  <span>
                    <strong>{person?.name || "Conversation"}</strong>
                    <small>{last?.body || "No messages yet"}</small>
                  </span>
                  <i>
                    <small>{timeOf(last?.created_at)}</small>
                    {unread > 0 && <b>{unread}</b>}
                  </i>
                </button>
              );
            })}
          </aside>
          <section>
            {active ? (
              <>
                <header>
                  <Avatar initials={initialsOf(otherParticipant(active, user?.id)?.name)} />
                  <div>
                    <strong>{otherParticipant(active, user?.id)?.name}</strong>
                    <small>{otherParticipant(active, user?.id)?.role?.replace("_", " ").toLowerCase()}</small>
                  </div>
                  <button className="icon-btn">
                    <MoreHorizontal />
                  </button>
                </header>
                <div className="message-history">
                  {active.messages.length ? (
                    active.messages.map((m) => (
                      <div className={`message ${m.sender?.id === user?.id ? "mine" : ""}`} key={m.id}>
                        <p>{m.body}</p>
                        <small>{timeOf(m.created_at)}</small>
                      </div>
                    ))
                  ) : (
                    <div className="date-divider">
                      <span>Say hello to get started</span>
                    </div>
                  )}
                </div>
                <form onSubmit={send}>
                  <button type="button">
                    <Paperclip />
                  </button>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" />
                  <button type="button">
                    <Smile />
                  </button>
                  <Button aria-label="Send" disabled={sending || !text.trim()}>
                    <Send />
                  </Button>
                </form>
              </>
            ) : (
              <EmptyState title="Select a conversation" description="Choose a conversation from the list to view messages." />
            )}
          </section>
        </div>
      )}
    </>
  );
}
export function ComingSoon({ title = "Page ready for integration", description = "This workspace is prepared for the matching Django REST endpoint." }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="panel">
        <EmptyState title="Nothing to show yet" description="Live records will appear here as soon as the backend responds." />
      </div>
    </>
  );
}
