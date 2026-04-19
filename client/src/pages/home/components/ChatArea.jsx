import { useDispatch, useSelector } from "react-redux"
import { createNewMessage, getAllMessages } from "../../../apiCalls/Message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { clearUnreadMessageCount } from "../../../apiCalls/Chat";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import moment from 'moment';
import store from './../../../redux/store';
import { setAllChats } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react"

const ChatArea = ({ socket, onlineUser }) => {

  const dispatch = useDispatch();
  const { selectedChat, user, allChats } = useSelector(state => state.userReducer);
  const selectedUser = selectedChat.members.find( u => u._id !== user._id);
  const isOnline = onlineUser.includes(selectedUser._id);
  
  const [ message, setMessage ] = useState('');
  const [ allMessages, setAllMessages ] = useState([]);
  const [ isTyping, setIsTyping ] = useState(false);
  const [ showEmojiPicker, setShowEmojiPicker ] = useState(false);
  const [ data, setData ] = useState(null);

  const sendMessage = async (image) => {
    try {
      const newMessage = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
        image: image
      }

      socket.emit('send-message', {
        ...newMessage,
        members: selectedChat.members.map(m => m._id),
        read: false,
        createdAt: moment().format('YYYY-MM-DD hh:mm:ss')
      })

      const response = await createNewMessage(newMessage);

      if(response.success){
        setMessage('');
        setShowEmojiPicker(false);
      }

    } catch (error) {
      toast.error(error.message || "Failed to send message. Please try again.");
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
      toast.error(error.message || "Failed to load messages.");
    }
  }

  const clearUnreadMessages = async () => {
    try {

      socket.emit('clear-unread-messages', {
        chatId: selectedChat._id,
        members: selectedChat.members.map(m => m._id)
      })

      const response = await clearUnreadMessageCount(selectedChat._id);

      if(response.success){
          allChats.map(chat => {
            if(chat._id === selectedChat._id){
              return response.data;
            }
            return chat
          })
      }

    } catch (error) {
      toast.error(error.message || "Error clearing unread messages.");
    }
  }

  const formatName = (user) => {
    let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
    let lname = user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();

    return fname + " " + lname;
  }

  const sendImage = async(e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader(file);
      reader.readAsDataURL(file);

      reader.onloadend = async() => {
          sendMessage(reader.result);
      }
  }


  useEffect(() => {
    getMessages();
    if(selectedChat?.lastMessage?.sender !== user._id){
      clearUnreadMessages();
    }

    socket.off('receive-message').on('receive-message', (message) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      if(selectedChat?._id === message.chatId){
        setAllMessages(prevmsg => [...prevmsg, message])
      }

      if(selectedChat?._id === message.chatId && message.sender !== user._id){
        clearUnreadMessages();
      }
    })

    socket.on('message-count-cleared', data => {
        const selectedChat = store.getState().userReducer.selectedChat;
        const allChats = store.getState().userReducer.allChats;

        if(selectedChat?._id === data.chatId){
          const updatedChats = allChats.map(chat => {
              if(chat._id === data.chatId){
                  return { ...chat, unReadMessageCount: 0}
            }
            return chat;
          })
          dispatch(setAllChats(updatedChats));
          setAllMessages( prevMsgs => {
            return prevMsgs.map(msg => {
              return { ...msg, read: true}
            })
          })
        }
    })

    socket.on('started-typing', (data) => {
      setData(data)
        if(selectedChat?._id === data.chatId && data.sender !== user._id){
          setIsTyping(true);
          setTimeout(() => {
              setIsTyping(false);
          }, 2000)
        }
    })

  },[selectedChat, dispatch, socket, user._id])

  useEffect(() => {
      const msgContainer = document.getElementById('main-chat-area');
      msgContainer.scrollTop = msgContainer.scrollHeight
  }, [allMessages, isTyping])

  return ( 
    <>
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {selectedChat && (
        <>
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e74c3c] text-white flex items-center justify-center font-bold">
                {selectedUser.firstname.charAt(0).toUpperCase() + selectedUser.lastname.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-gray-800 leading-tight">{formatName(selectedUser)}</h2>
                <p className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                  {isOnline ? 'Active Now' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-[#e74c3c] hover:bg-red-50 rounded-lg transition-all">
                <i className="fa fa-phone text-lg"></i>
              </button>
              <button className="p-2 text-gray-400 hover:text-[#e74c3c] hover:bg-red-50 rounded-lg transition-all">
                <i className="fa fa-video-camera text-lg"></i>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <i className="fa fa-info-circle text-lg"></i>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30" id="main-chat-area">
            {allMessages.map((msg, index) => {
              const isCurrentUserSender = msg.sender === user._id;
              return (
                <div 
                  key={index}
                  className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isCurrentUserSender ? 'items-end' : 'items-start'}`}>
                    <div className={`
                      px-4 py-2.5 rounded-2xl text-sm shadow-sm
                      ${isCurrentUserSender 
                        ? 'bg-[#e74c3c] text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}
                    `}>
                      {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                      {msg.image && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-white/20">
                          <img src={msg.image} alt="shared" className="max-w-full h-auto max-h-75 object-contain" />
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-gray-400 font-medium ${isCurrentUserSender ? 'flex-row-reverse' : ''}`}>
                      <span>{formatTime(msg.createdAt)}</span>
                      {isCurrentUserSender && (
                        <i className={`fa ${msg.read ? 'fa-check-circle text-blue-500' : 'fa-check'}`}></i>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && selectedChat?.members.map(m => m._id).includes(data?.sender) && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emoji Picker Overlay */}
          {showEmojiPicker && (
            <div className="absolute bottom-24 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 transition-all">
                <EmojiPicker 
                  height={400} 
                  width={300}
                  onEmojiClick={(e) => setMessage(message + e.emoji)}
                  previewConfig={{ showPreview: false }}
                />
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#e74c3c]/10 focus-within:border-[#e74c3c] transition-all">
              <label 
                htmlFor="file" 
                className="p-2.5 text-gray-400 hover:text-[#e74c3c] hover:bg-white rounded-xl cursor-pointer transition-all active:scale-90"
                title="Send Image"
              >
                <i className="fa fa-picture-o text-lg"></i>
                <input 
                  type="file" 
                  id="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={sendImage}
                />
              </label>
              
              <button 
                className="p-2.5 text-gray-400 hover:text-[#e74c3c] hover:bg-white rounded-xl transition-all active:scale-90"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Emoji"
              >
                <i className="fa fa-smile-o text-lg"></i>
              </button>

              <input 
                type="text" 
                className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm text-gray-700 placeholder-gray-400"
                placeholder="Type a message..." 
                value={message} 
                onChange={(e) => {
                  setMessage(e.target.value)
                  socket.emit('user-typing', {
                    chatId: selectedChat._id,
                    members: selectedChat.members.map(m => m._id),
                    sender: user._id
                  })
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage('')}
              />

              <button 
                className={`
                  p-3 rounded-xl transition-all shadow-sm active:scale-95
                  ${message.trim() ? 'bg-[#e74c3c] text-white hover:bg-[#c0392b]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
                onClick={() => message.trim() && sendMessage('')}
                disabled={!message.trim()}
              >
                <i className="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  )
}

export default ChatArea