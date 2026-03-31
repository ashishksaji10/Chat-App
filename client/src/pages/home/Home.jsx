import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:5000");

const Home = () => {
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUser, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      socket.emit("join-room", user._id);
      socket.emit("user-login", user._id);
    }
  }, [user]);

  useEffect(() => {
    socket.on("online-users", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });
    socket.on("online-user-updated", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    return () => {
      socket.off("online-users");
      socket.off("online-user-updated");
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Header socket={socket} />
      <main className="flex grow w-full max-w-7xl mx-auto md:p-4 gap-4 overflow-hidden">
        <Sidebar socket={socket} onlineUser={onlineUser} />
        {selectedChat ? (
          <ChatArea socket={socket} onlineUser={onlineUser} />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa fa-comments text-3xl text-red-500"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-700">
                Select a chat to start messaging
              </h2>
              <p className="text-gray-500 mt-2">
                Search for users and click on them to start a conversation.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
