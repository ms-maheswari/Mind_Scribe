import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrl from "../api";
// Utility function: getInitials
const getInitials = (name) => {
  if (!name) return "";

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

const Navbar = ({ onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setUserInfo(storedUser);
    }
  }, []);

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/auth/signout`, {
        withCredentials: true,
      });

      if (res.data.success) {
        // Clear user info from localStorage and state
        localStorage.removeItem("currentUser");
        setUserInfo(null);
        toast.success("Logged out successfully");
        navigate("/");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <Link to={"/"}>
        <h2 className="text-2xl italic font-medium text-black py-2">
          <span className="text-slate-500">Mind</span>
          <span className="text-slate-900">Scribe</span>
        </h2>
      </Link>

     

      {/* ProfileInfo Integrated */}
      <div className="flex items-center gap-3">
        {userInfo ? (
          <>
           {/* Search Bar Integrated */}
      <div className="w-40 sm:w-60 md:w-80 flex items-center px-4 bg-slate-100 rounded-md">
        <input
          type="text"
          placeholder="Search Notes..."
          className="w-full text-xs bg-transparent py-[11px] outline-none"
          value={searchQuery}
          onChange={({ target }) => setSearchQuery(target.value)}
        />

        {searchQuery && (
          <IoMdClose
            className="text-slate-500 text-xl cursor-pointer hover:text-black mr-3"
            onClick={onClearSearch}
          />
        )}

        <FaMagnifyingGlass
          className="text-slate-500 text-xl cursor-pointer hover:text-black mr-3"
          onClick={handleSearch}
        />
      </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
              {getInitials(userInfo.username)}
            </div>

            <Link to="/home" className="text-sm bg-blue-500 px-8 py-2 rounded-md text-white hover:opacity-80">
            Notes
          </Link>
            {/* <div>
              <p className="text-sm font-medium">{userInfo.username}</p>
            </div> */}

            <button
              className="text-sm bg-red-500 px-8 py-2 rounded-md text-white hover:opacity-80"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm bg-blue-500 px-8 py-2 rounded-md text-white hover:opacity-80">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
