import { useEffect, useState } from "react";
import { getProfile, updateProfile, updatePassword } from "../api/user";

const Profile = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const validatePassword = (password) => {
  const regex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{8,}$/;

  return regex.test(password);
};

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setUser(res.data);
      setName(res.data.name);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ name });
      setUser(res.data);
      alert("Profile updated ✅");
    } catch (err) {
      console.error(err);
    }
  };
  const handleUpdatePassword = async (e) => {
  e.preventDefault();

  if (!currentPassword || !newPassword) {
    alert("Please fill all password fields.");
    return;
  }

  if (!validatePassword(newPassword)) {
    alert(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character."
    );
    return;
  }

  try {
    await updatePassword({
      currentPassword,
      newPassword,
    });

    alert("Password updated 🔐");

    setCurrentPassword("");
    setNewPassword("");
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Failed to update password"
    );
  }
};

  return (
    <div className="profile-page">
      <header className="profile-page-header">
        <p>ACCOUNT SETTINGS</p>
        <h2>Your profile</h2>
        <span>Manage your personal details and account security.</span>
      </header>
      <div className="profile-summary-card">
        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h3>{user.name || "Your account"}</h3>
          <p>{user.email || "Email address"}</p>
        </div>
        <div className="profile-joined">
          <span>Member since</span>
          <strong>
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "—"}
          </strong>
        </div>
      </div>
      <div className="profile-settings-grid">
        <form onSubmit={handleUpdateProfile} className="profile-settings-card">
          <div className="profile-card-heading">
            <h4>Personal details</h4>
            <p>Choose how your name appears on your account.</p>
          </div>
          <label htmlFor="profile-name">Display name</label>
          <input
            id="profile-name"
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary">Save changes</button>
        </form>
        <form onSubmit={handleUpdatePassword} className="profile-settings-card">
          <div className="profile-card-heading">
            <h4>Password</h4>
            <p>Use a strong password to keep your account secure.</p>
          </div>
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            placeholder="Enter current password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            placeholder="Create a new password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className="btn profile-password-btn">Update password</button>
        </form>
      </div>
    </div>
  );
};
export default Profile;
