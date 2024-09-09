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
  try {
    const res = await axios.post(
      `${apiUrl}/api/auth/signin`,
      { email, password },
      { withCredentials: true }
    );
    console.log("Login Response:", res.data); // Check if the token is here
    if (res.data.success) {
      // Store token and user data in localStorage
      localStorage.setItem("currentUser", JSON.stringify({
        userId: res.data.user._id,
        token: res.data.token, // Ensure this is coming from the backend
      }));
      toast.success("Login successful");
      navigate("/home");
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    toast.error("Invalid email or password");
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
