import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => api.get("/notifications?limit=100")
    .then((response) => setNotifications(response.data.data || []))
    .catch(() => setError("Unable to load notifications."))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  const clearRead = async () => {
    await api.delete("/notifications/read");
    setNotifications((current) => current.filter((item) => !item.isRead));
  };

  const markRead = async (notification) => {
    if (notification.isRead) return;
    await api.patch(`/notifications/${notification._id}/read`);
    setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, isRead: true } : item));
  };

  const remove = async (notification) => {
    await api.delete(`/notifications/${notification._id}`);
    setNotifications((current) => current.filter((item) => item._id !== notification._id));
  };

  return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel notifications-page">
    <header className="decisions-page-header"><div><p className="eyebrow">ACTIVITY CENTER</p><h1>Notifications</h1><p className="dashboard-subtitle">Stay informed about important system events and AI monitoring alerts.</p></div><div className="notification-header-actions"><button className="secondary-button" type="button" onClick={markAll}>Mark all as read</button><button className="secondary-button" type="button" onClick={clearRead}>Clear read notifications</button></div></header>
    {error && <div className="error-message">{error}</div>}
    {loading ? <div className="dashboard-empty">Loading notifications...</div> : !notifications.length ? <div className="dashboard-content-card dashboard-empty"><strong>No notifications yet.</strong><p>Important AI, review, application, and system alerts will appear here.</p></div> : <section className="notification-list">{notifications.map((notification) => <NotificationCard key={notification._id} notification={notification} onRead={markRead} onDelete={remove} />)}</section>}
  </section></main>;
}

function NotificationCard({ notification, onRead, onDelete }) {
  const category = categoryFor(notification.type);
  return <article className={`notification-item ${notification.isRead ? "read" : "unread"}`} onClick={() => onRead(notification)}><div className={`notification-icon ${category.replace(" ", "-")}`}>{iconFor(category)}</div><div className="notification-content"><div className="notification-title-row"><span className="notification-category">{category}</span>{!notification.isRead && <span className="notification-unread-dot" aria-label="Unread" />}</div><h2>{notification.title}</h2><p>{notification.message}</p><div className="notification-meta"><span>{notification.relatedDecision?.externalDecisionId ? `Decision ${notification.relatedDecision.externalDecisionId}` : "System notification"}</span><time>{formatDate(notification.createdAt)}</time></div><div className="notification-actions">{notification.relatedDecision?._id && <Link to={`/decisions/${notification.relatedDecision._id}`} onClick={(event) => event.stopPropagation()}>View Decision</Link>}{category === "human review" && notification.relatedDecision?._id && <Link to="/reviews" onClick={(event) => event.stopPropagation()}>Review</Link>}{!notification.isRead && <button type="button" onClick={(event) => { event.stopPropagation(); onRead(notification); }}>Mark as read</button>}<button className="notification-delete" type="button" onClick={(event) => { event.stopPropagation(); onDelete(notification); }}>Delete</button></div></div></article>;
}

function categoryFor(type) { const value = String(type || "system").toLowerCase(); if (value.includes("risk")) return "high risk"; if (value.includes("review")) return "human review"; if (value.includes("application")) return "application"; if (value.includes("audit")) return "audit"; return "system"; }
function iconFor(category) { return { "high risk": "!", "human review": "✓", application: "▣", audit: "◫", system: "i" }[category] || "i"; }
function formatDate(value) { return value ? new Date(value).toLocaleString() : "—"; }
export default Notifications;
