import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyEmail } from "../api/authApi";
import "./Auth.css";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const verifyUserEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        console.log("Verification token:", token);

        const res = await verifyEmail(token);

        console.log("Verification response:", res.data);

        setStatus("success");

        setMessage(
          res.data.message || "Email verified successfully."
        );
      } catch (err) {
        console.error(
          "Email verification error:",
          err.response?.data || err
        );

        setStatus("error");

        setMessage(
          err.response?.data?.message ||
            "This verification link is invalid or has expired."
        );
      }
    };

    verifyUserEmail();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-box verify-email-box">

        <div className="auth-brand">
          The Indian Guide Technology
        </div>

        {status === "verifying" && (
          <div className="verify-email-content">

            <div className="verify-icon verifying">
              ...
            </div>

            <div className="auth-heading">
              <p className="auth-kicker">
                Please wait
              </p>

              <h2>
                Verifying your email.
              </h2>

              <p>
                We're confirming your email address.
              </p>
            </div>

          </div>
        )}

        {status === "success" && (
          <div className="verify-email-content">

            <div className="verify-icon success">
              ✓
            </div>

            <div className="auth-heading">

              <p className="auth-kicker">
                Email verified
              </p>

              <h2>
                Your email is verified.
              </h2>

              <p>
                {message}
              </p>

            </div>

            <button
              className="auth-submit"
              onClick={() => navigate("/login")}
            >
              Continue to login
              <span aria-hidden="true">→</span>
            </button>

          </div>
        )}

        {status === "error" && (
          <div className="verify-email-content">

            <div className="verify-icon error">
              !
            </div>

            <div className="auth-heading">

              <p className="auth-kicker">
                Verification failed
              </p>

              <h2>
                We couldn't verify your email.
              </h2>

              <p>
                {message}
              </p>

            </div>

            <button
              className="auth-submit"
              onClick={() => navigate("/login")}
            >
              Go to login
              <span aria-hidden="true">→</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;