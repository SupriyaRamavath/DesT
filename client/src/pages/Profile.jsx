import { useState } from "react";

function Profile() {

  const [name, setName] = useState("Supriya Bai");
  const [email, setEmail] = useState("supriya@example.com");

  const handleSave = (e) => {
    e.preventDefault();

    alert("Profile updated successfully.");
  };

  return (
    <div>

      <div className="page-header">

        <div>
          <h1>Profile</h1>
          <p>Manage your DecisionTrace account.</p>
        </div>

      </div>

      <div className="profile-grid">

        <div className="panel profile-summary">

          <div className="profile-avatar">
            SB
          </div>

          <h2>Supriya Bai</h2>

          <p>Developer</p>

          <span className="badge active">
            Active
          </span>

        </div>

        <div className="panel">

          <h2>Personal Information</h2>

          <form onSubmit={handleSave}>

            <div className="form-group">

              <label>Full Name</label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

            </div>

            <div className="form-group">

              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>

            <div className="form-group">

              <label>Role</label>

              <input
                value="Developer"
                disabled
              />

            </div>

            <button className="primary-button">
              Save Changes
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Profile;