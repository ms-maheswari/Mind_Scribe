import React, { useEffect, useState } from "react";
import NoteCard from "../components/NoteCard";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import AddEditNotes from "./AddEditNotes";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import apiUrl from "../api";

const Home = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  // Fetch the user info from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    console.log("Stored User:", storedUser);
    if (storedUser) {
      setUserInfo(storedUser);
    }
  }, []);

  // Function to get all notes from the server
  const getAllNotes = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      console.log("Token being sent:", token);
      const res = await axios.get(`${apiUrl}/api/note/all`, {
        headers:{
          Authorization: `Bearer ${token}`
        },
        withCredentials: true, // Ensures cookies are sent
      });
      setAllNotes(res.data.notes);
    } catch (error) {
      if (error.response.status === 401) {
      toast.error("Session expired. Please log in again.");
      navigate("/login"); // Redirect to login page
    } else {
      console.error("Fetch Notes Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.message);
    }
  }
};

  // Fetch notes on component load
  useEffect(() => {
    getAllNotes();
  }, []);

  // Handle note editing
  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  // Delete a note
  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const res = await axios.delete(`${apiUrl}/api/note/delete/${noteId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        getAllNotes(); // Fetch updated notes after deletion
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Search for notes
  const onSearchNote = async (query) => {
    try {
      const res = await axios.get(`${apiUrl}/api/note/search`, {
        params: { query },
        withCredentials: true,
      });
      if (res.data.success) {
        setIsSearch(true);
        setAllNotes(res.data.notes);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Clear the search and fetch all notes again
  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes(); // Fetch all notes again after clearing the search
  };

  // Update the pin status of a note
  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const res = await axios.put(
        `${apiUrl}/api/note/update-note-pinned/${noteId}`,
        { isPinned: !noteData.isPinned },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        getAllNotes(); // Fetch notes after updating pin status
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {userInfo ? (
        <Navbar
          userInfo={userInfo}
          onSearchNote={onSearchNote}
          handleClearSearch={handleClearSearch}
        />
      ) : null}

      <div className="container mx-auto p-6">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8 max-md:m-5">
            {allNotes.map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                date={note.createdAt}
                content={note.content}
                tags={note.tags}
                isPinned={note.isPinned}
                onEdit={() => handleEdit(note)}
                onDelete={() => deleteNote(note)}
                onPinNote={() => updateIsPinned(note)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20">
            <img
              src={
                isSearch
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtakcQoMFXwFwnlochk9fQSBkNYkO5rSyY9A&s"
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDCtZLuixBFGTqGKdWGLaSKiO3qyhW782aZA&s"
              }
              alt="No notes"
              className="w-60"
            />
            <p className="w-1/2 text-sm font-medium text-slate-700 text-center leading-7 mt-5">
              {isSearch
                ? "Oops! No Notes found matching your search"
                : `Ready to capture your ideas? Click the 'Add' button to start noting down your thoughts, inspiration, and reminders.`}
            </p>
          </div>
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#2B85FF] hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => setOpenAddEditModal({ isShown: true, type: "add", data: null })}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: "add", data: null })
        }
        style={{ overlay: { backgroundColor: "rgba(0,0,0,0.2)" } }}
        className="w-[40%] max-md:w-[60%] max-sm:w-[70%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
          noteData={openAddEditModal.data}
          type={openAddEditModal.type}
          getAllNotes={getAllNotes} // Pass the getAllNotes function
        />
      </Modal>
    </>
  );
};

export default Home;
