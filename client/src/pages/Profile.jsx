import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";

function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  useEffect(() => {
    api.get("/auth/me").then((response) => {
      updateUser(response.data.user);
      setForm({ name: response.data.user.name || "", email: response.data.user.email || "" });
    }).catch(() => setMessage({ type: "error", text: "Unable to refresh account information." }));
  // Auth context exposes updateUser as an intentionally stable-by-use API.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await api.patch("/auth/profile", form);
      updateUser(response.data.user);
      setMessage({ type: "success", text: "Profile changes saved successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to update your profile." });
    } finally { setSaving(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await api.patch("/auth/password", password);
      setPassword({ currentPassword: "", newPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to change your password." });
    } finally { setPasswordSaving(false); }
  };

  const initials = (user?.name || "U").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel profile-page">
    <header className="decisions-page-header"><div><p className="eyebrow">ACCOUNT</p><h1>My Profile</h1><p className="dashboard-subtitle">View and manage your DesT account information.</p></div></header>
    {message.text && <div className={`${message.type === "error" ? "error-message" : "success-message"}`}>{message.text}</div>}
    <div className="profile-page-grid"><section className="detail-card profile-identity"><div className="profile-avatar-large">{initials}</div><h2>{user?.name}</h2><p>{user?.email}</p><span className="profile-role-badge">{capitalize(user?.role)}</span><span className="profile-active-badge">{user?.isActive === false ? "Inactive" : "Active"}</span><div className="profile-identity-meta"><span>Joined <b>{formatDate(user?.createdAt)}</b></span><span>Last login <b>{formatDate(user?.lastLoginAt)}</b></span></div></section><section className="detail-card"><CardHeading title="Profile Information" /><form className="profile-form" onSubmit={saveProfile}><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Role<input disabled value={capitalize(user?.role)} /></label><div className="application-form-actions"><button className="secondary-button" type="button" onClick={() => setForm({ name: user?.name || "", email: user?.email || "" })}>Cancel</button><button className="primary-button action-accent" disabled={saving} type="submit">{saving ? "Saving..." : "Save Changes"}</button></div></form></section><section className="detail-card"><CardHeading title="Account Information" /><div className="profile-info-list"><span>User ID <b>{user?.id || "—"}</b></span><span>Role <b>{capitalize(user?.role)}</b></span><span>Account status <b>{user?.isActive === false ? "Inactive" : "Active"}</b></span><span>Account created <b>{formatDate(user?.createdAt)}</b></span></div></section><section className="detail-card"><CardHeading title="Security" /><form className="profile-form" onSubmit={changePassword}><label>Current password<input required type="password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} /></label><label>New password<input required minLength="8" type="password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} /></label><button className="primary-button action-accent" disabled={passwordSaving} type="submit">{passwordSaving ? "Changing..." : "Change Password"}</button></form><div className="profile-security-links"><button type="button" onClick={() => setMessage({ type: "success", text: "Your current session is active and protected." })}>Active Sessions</button><button type="button" onClick={() => { logout(); navigate("/login"); }}>Logout</button></div></section><section className="detail-card profile-preferences"><CardHeading title="Preferences" /><Preference label="Notification preferences" /><Preference label="Email alerts" /><Preference label="High-risk decision alerts" /></section></div>
  </section></main>;
}

function Preference({ label }) { return <label className="preference-row"><span>{label}</span><input type="checkbox" defaultChecked /></label>; }
function CardHeading({ title }) { return <div className="detail-card-heading"><p className="eyebrow">{title.toUpperCase()}</p><h2>{title}</h2></div>; }
function capitalize(value) { return String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value) { return value ? new Date(value).toLocaleDateString() : "Not recorded"; }
export default Profile;
