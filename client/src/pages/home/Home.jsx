import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io('http://localhost:5000');

const Home = () => {
  const { selectedChat, user } = useSelector(state => state.userReducer);
  const [ onlineUser, setOnlineUsers ] = useState([]);
  

  useEffect(() => {
    if(user){
      socket.emit('join-room', user._id);
      socket.emit('user-login', user._id);
      socket.on('online-users', onlineUsers => {
          setOnlineUsers(onlineUsers);
      })
      socket.on('online-user-updated', onlineUsers => {
          setOnlineUsers(onlineUsers);
      })
    }
  }, [user])

  return (
    <div className="home-page">
      <Header socket={socket}/>
        <div className="main-content">
            <Sidebar socket={socket} onlineUser={onlineUser}/> 
            {selectedChat && <ChatArea socket={socket} />}
        </div>
    </div>
  )
}

export default Home