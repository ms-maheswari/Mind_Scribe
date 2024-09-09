import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../utils/helper";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import apiUrl from "../api";
const PasswordInput = ({ value, onChange }) => {
  return (
    <input
      type="password"
      placeholder="Password"
      className="input-box"
      value={value}
      onChange={onChange}
    />
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();

  if (!validateEmail(email)) {
    setError("Please enter a valid email address");
    return;
  }

  if (!password) {
    setError("Please enter the password");
    return;
  }

  setError("");

  try {
    const res = await axios.post(
      `${apiUrl}/api/auth/signin`,
      { email, password },
      { withCredentials: true }
    );

    console.log("Login Response:", res.data); // Log the response to check for the token

    if (!res.data.success) {
      toast.error(res.data.message);
      return;
    }

    // Ensure token is present in the response
    const token = res.data.token;
    if (!token) {
      throw new Error("Token is missing in the login response");
    }

    // Save user info and token to localStorage
    localStorage.setItem("currentUser", JSON.stringify({
      userId: res.data.user._id,
      token: token, // Store the token
      email: res.data.user.email,
      username: res.data.user.username
    }));

    toast.success("Login successful");

    // Navigate to home after login
    navigate("/home");
  } catch (error) {
    toast.error("Invalid email or password");
    setError(error.message);
  }
};

  return (
    <>
    <Navbar />
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <form onSubmit={handleLogin}>
          <h4 className="text-2xl mb-7">Login</h4>

          <input
            type="text"
            placeholder="Email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm pb-1">{error}</p>}

          <button type="submit" className="btn-primary">
            LOGIN
          </button>

          <p className="text-sm text-center mt-4">
            Not registered yet?{" "}
            <Link to={"/signup"} className="font-medium text-[#2B85FF] underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
    </>
  );
};

export default Login;
