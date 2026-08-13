import { useEffect, useState } from "react";
import { getProfile, updateProfile, updatePassword } from "../api/user";

const Profile = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setUser(res.data);
      setName(res.data.name);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ update username
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

  // ✅ update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    try {
      await updatePassword({ currentPassword, newPassword });

      alert("Password updated 🔐");

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Profile</h2>

      {/* 👤 USER INFO */}
      <div className="card p-3 mb-4">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Joined:</strong>{" "}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* ✏️ UPDATE USERNAME */}
      <form onSubmit={handleUpdateProfile} className="mb-4">
        <h4>Update Username</h4>

        <input
          type="text"
          className="form-control mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="btn btn-primary">Update</button>
      </form>

      {/* 🔐 UPDATE PASSWORD */}
      <form onSubmit={handleUpdatePassword}>
        <h4>Change Password</h4>

        <input
          type="password"
          placeholder="Current Password"
          className="form-control mb-2"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          className="form-control mb-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button className="btn btn-warning">Change Password</button>
      </form>
    </div>
  );
};

export default Profile;
