import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useEffect } from 'react';

const socket = io('http://localhost:5000');

const Home = () => {
  const { selectedChat, user } = useSelector(state => state.userReducer);
  

  useEffect(() => {
    if(user){
      socket.emit('join-room', user._id);
    }
  }, [user])

  return (
    <div className="home-page">
      <Header />
        <div className="main-content">
            <Sidebar /> 
            {selectedChat && <ChatArea socket={socket} />}
        </div>
    </div>
  )
}

export default Home