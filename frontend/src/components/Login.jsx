import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import apiUrl from "../api";
import Cookies from 'js-cookie';  // Import cookies to store token if needed

const PasswordInput = ({ value, onChange }) => (
  <input
    type="password"
    placeholder="Password"
    className="input-box"
    value={value}
    onChange={onChange}
  />
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${apiUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }  // Ensures cookies are sent and received
      );

      console.log("Login Response:", res.data);

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      const token = res.data.token;  // Make sure the token is being received
      if (!token) {
        throw new Error("Token is missing in the login response");
      }

      // Store the token in localStorage and optionally in cookies
      localStorage.setItem("currentUser", JSON.stringify({
        userId: res.data.user._id,
        token: token,  // Store the token here
        email: res.data.user.email,
        username: res.data.user.username
      }));

      // Optionally store the token in cookies
      Cookies.set('access_token', token);

      toast.success("Login successful");

      // Navigate to the home page after successful login
      navigate("/home");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Invalid email or password");
      setError("Invalid email or password");
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
              required
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
