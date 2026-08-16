import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOTP, forgotPassword } from "../api/authApi";
import "./Auth.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputs = useRef([]);

  // Countdown
  useState(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .trim();

    if (!/^\d{6}$/.test(pasted)) return;

    const digits = pasted.split("");

    setOtp(digits);

    digits.forEach((digit, i) => {
      if (inputs.current[i]) {
        inputs.current[i].value = digit;
      }
    });

    inputs.current[5].focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      return alert("Enter all 6 digits.");
    }

    try {
      setLoading(true);

      const res = await verifyOTP({
        email,
        otp: code,
      });

      alert(res.data.message);

      navigate("/reset-password", {
        state: { email },
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Invalid OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await forgotPassword({ email });

      alert("OTP sent again.");

      setTimer(60);
    } catch (err) {
      alert("Couldn't resend OTP.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <div className="auth-brand">
          Indian Technology Guide
        </div>

        <div className="auth-heading">
          <p className="auth-kicker">
            Verify OTP
          </p>

          <h2>Enter Verification Code</h2>

          <p>
            We've sent a 6-digit OTP to
            <br />
            <strong>{email}</strong>
          </p>
        </div>

        <div
          className="otp-container"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleChange(
                  e.target.value,
                  index
                )
              }
              onKeyDown={(e) =>
                handleKeyDown(e, index)
              }
              className="otp-input"
            />
          ))}
        </div>

        <button
          className="auth-submit"
          disabled={loading}
          onClick={handleVerify}
        >
          {loading
            ? "Verifying..."
            : "Verify OTP"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {timer > 0 ? (
            <>Resend OTP in {timer}s</>
          ) : (
            <button
              onClick={resendOTP}
              style={{
                border: "none",
                background: "none",
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              Resend OTP
            </button>
          )}
        </p>

      </div>
    </div>
  );
};

export default VerifyOTP;