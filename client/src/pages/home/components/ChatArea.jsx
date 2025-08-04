import { useDispatch, useSelector } from "react-redux"
import { createNewMessage, getAllMessages } from "../../../apiCalls/Message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { clearUnreadMessageCount } from "../../../apiCalls/Chat";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import moment from 'moment';

const ChatArea = () => {

  const dispatch = useDispatch();
  const { selectedChat, user, allChats } = useSelector(state => state.userReducer);
  const selectedUser = selectedChat.members.find( u => u._id !== user._id);
  
  const [ message, setMessage ] = useState('');
  const [ allMessages, setAllMessages ] = useState([]);
  const sendMessage = async () => {
    try {
      const newMessage = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
      }

      dispatch(showLoader());
      const response = await createNewMessage(newMessage);
      dispatch(hideLoader());

      if(response.success){
        setMessage('');
      }

    } catch (error) {
      dispatch(hideLoader())
      toast.error(error.message)
    }
  }

  const formatTime = (timestamp) => {
    const now = moment();
    const diff = now.diff(moment(timestamp), 'days');

    if(diff < 1){
      return `Today ${moment(timestamp).format('hh:mm A')}`;
    }else if(diff === 1){
      return `Yesterday ${moment(timestamp).format('hh:mm A')}`;
    }else {
      return moment(timestamp).format('MMM D, hh:mm A');
    }
  }

  const getMessages = async () => {
    try {

      dispatch(showLoader());
      const response = await getAllMessages(selectedChat._id);
      dispatch(hideLoader());

      if(response.success){
        setAllMessages(response.data);
      }

    } catch (error) {
      dispatch(hideLoader())
      toast.error(error.message)
    }
  }

  const clearUnreadMessages = async () => {
    try {

      dispatch(showLoader());
      const response = await clearUnreadMessageCount(selectedChat._id);
      dispatch(hideLoader());

      if(response.success){
          allChats.map(chat => {
            if(chat._id === selectedChat._id){
              return response.data;
            }
            return chat
          })
      }

    } catch (error) {
      dispatch(hideLoader())
      toast.error(error.message)
    }
  }

  const formatName = (user) => {
    let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
    let lname = user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();

    return fname + " " + lname;
}


  useEffect(() => {
    getMessages();
    if(selectedChat.lastMessage.sender !== user._id){
      clearUnreadMessages();
    }
  },[selectedChat])

  return ( 
    <>
      { selectedChat && <div className="app-chat-area">
          <div className="app-chat-area-header">
              { formatName(selectedUser) }
          </div>
          <div className="main-chat-area">
            { allMessages.map(msg => {
              const isCurrentUserSender = msg.sender === user._id;
                return <div className="message-container" style={isCurrentUserSender ? {justifyContent: 'end'} : { justifyContent: 'start'}}>
                  <div>
                    <div className={isCurrentUserSender ? "send-message": "received-message"}>
                        { msg.text }
                    </div>
                    <div className="message-timestamp" style={isCurrentUserSender ? {float: 'right'}: {float: 'left'}}>
                        { formatTime(msg.createdAt) }
                    </div>
                  </div>
              </div>
            })}
            
          </div>
          <div className="send-message-div">
              <input type="text" className="send-message-input" placeholder="Type a message" value={message} onChange={ (e) => setMessage(e.target.value)}/>
              <button className="fa fa-paper-plane send-message-btn" aria-hidden="true" onClick={ sendMessage }></button>
          </div>
        </div> }
    </>
  )
}

export default ChatArea