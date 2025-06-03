// AuthSuccess.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Optionally, decode the token to get user details
      navigate("/"); // redirect to the homepage or dashboard
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Processing your authentication...</p>
    </div>
  );
}

export default AuthSuccess;
