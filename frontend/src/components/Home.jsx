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
  
    const navigate = useNavigate();
    const [openAddEditModal, setOpenAddEditModal] = useState({
      isShown: false,
      type: "add",
      data: null,
    });
  
    useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (storedUser) {
        setUserInfo(storedUser);
      }
    }, []);
    
  
  useEffect(() => {
    
  const getAllNotes = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/note/all`, {
        withCredentials: true,
      });
      setAllNotes(res.data.notes);

    } catch (error) {
      console.error("Fetch Notes Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.message);
    }
  };
    getAllNotes();
  }, []); 
  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const deleteNote = async (data) => {
    const noteId = data._id;

    try {
      const res = await axios.delete(
        `${apiUrl}/api/note/delete/` + noteId,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        await getAllNotes();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
  
    try {
      const res = await axios.put(
        `${apiUrl}/api/note/update-note-pinned/${noteId}`,
        { isPinned: !noteData.isPinned },
        { withCredentials: true } // This ensures cookies are sent with the request
      );
  
      if (res.data.success) {
        toast.success(res.data.message);
        await getAllNotes();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log("Error updating pin status:", error.response?.data || error.message);
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
          getAllNotes={getAllNotes}
        />
      </Modal>
    </>
  );
};

export default Home;