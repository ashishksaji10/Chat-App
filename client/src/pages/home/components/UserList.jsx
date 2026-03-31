import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast';
import { createNewChat } from './../../../apiCalls/Chat';
import { showLoader, hideLoader } from './../../../redux/loaderSlice';
import { setAllChats, setSelectedChat } from './../../../redux/userSlice';
import moment from 'moment';
import { useEffect } from 'react';
import store from '../../../redux/store';

const UserList = ({ searchKey, socket, onlineUser }) => {

    const { allUsers, allChats, user: currentUser, selectedChat } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();
    let response = null;
    const startNewChat = async  (searchedUserId) => {
        try {
            dispatch(showLoader())
            response = await createNewChat([currentUser._id, searchedUserId])
            dispatch(hideLoader())

            if(response.success){
                toast.success(response.message || "Conversation started!");
                const newChat = response.data;
                const updatedChat = [...allChats, newChat];
                dispatch(setAllChats(updatedChat));
                dispatch(setSelectedChat(newChat))
            } else {
                toast.error(response.message || "Could not start chat.");
            }
        } catch (error) {
            dispatch(hideLoader())
            toast.error(error.message || "An error occurred. Please try again.");
        }
    }

    const openChat = (searchedUserId) => {
        const chat = allChats.find(chat => 
            chat.members.map(m => m._id).includes(currentUser._id) &&
            chat.members.map(m => m._id).includes(searchedUserId));

        if(chat){
            dispatch(setSelectedChat(chat));
        }
    }

    const isSelectedChat = (user) => {
        if(selectedChat){
            return selectedChat.members.map(m => m._id).includes(user._id);
        }
        return false;
    }

    const getLastMessageTimeStamp = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));
        if(!chat || !chat?.lastMessage){
            return "";
        }else {
          return moment(chat?.lastMessage?.createdAt).format('hh:mm A');
        }
    }

    const getLastMessage = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));
        if(!chat || !chat.lastMessage){
            return ""
        }else {
            const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
            return msgPrefix + chat?.lastMessage?.text?.substring(0,25);
        }
    }

    const formatName = (user) => {
        let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        let lname = user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();

        return fname + " " + lname;
    }

    const getUnreadMessageCount = (userId) => {
        const chat = allChats.find(chat => 
            chat.members.map(m => m._id).includes(userId)
        );

        if(chat && chat.unReadMessageCount && chat.lastMessage.sender !== currentUser._id){
            return <div className='uread-message-counter'>{chat.unReadMessageCount}</div>
        }else{
            return ""
        }
    }

    useEffect(() => {
        socket.off('set-message-count').on('set-message-count', (message) => {
            const selectedChat = store.getState().userReducer.selectedChat;
            let allChats = store.getState().userReducer.allChats;
            
            if(selectedChat?._id !== message.chatId){
                const updatedChats = allChats.map(chat => {
                    if(chat._id === message.chatId){
                        return {
                            ...chat,
                            unReadMessageCount: (chat?.unReadMessageCount || 0) + 1,
                            lastMessage: message

                        }
                    }
                    return chat
                });
                allChats = updatedChats
            }
            const latestChat = allChats.find(chat => chat._id === message.chatId);
            
            const otherChats = allChats.filter(chat => chat._id !== message.chatId);
            allChats = [latestChat, ...otherChats];

            dispatch(setAllChats(allChats));
        })
    }, [])

    const getData = () => {
        if(searchKey === ""){
            return allChats;
        }else{
            return allUsers.filter(user => {
                return user.firstname.toLowerCase().includes(searchKey.toLowerCase()) || 
                    user.lastname.toLowerCase().includes(searchKey.toLowerCase());
            });
        }
    }


    return (
        <div className="flex flex-col">
            {(getData() || []).map(obj => {
                let user = obj;
                if(obj.members){
                    user = obj.members.find(mem => mem._id !== currentUser._id);
                }
                const isSelected = isSelectedChat(user);
                const isOnline = onlineUser.includes(user._id);
                const unreadCount = getUnreadMessageCount(user._id);

                return (
                    <div 
                        className={`group relative flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-gray-50
                            ${isSelected ? 'bg-red-50 border-l-4 border-l-[#e74c3c]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}
                        `} 
                        onClick={() => openChat(user._id)} 
                        key={user._id}
                    >
                        {/* Avatar Section */}
                        <div className="relative shrink-0">
                            {user.profilePic ? (
                                <img 
                                    src={user.profilePic} 
                                    alt="Profile" 
                                    className={`w-12 h-12 rounded-full object-cover ring-2 transition-all
                                        ${isOnline ? 'ring-green-400' : 'ring-gray-200 opacity-80'}
                                    `}
                                />
                            ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ring-2 transition-all
                                    ${isSelected ? 'bg-[#e74c3c] text-white' : 'bg-gray-100 text-gray-600'}
                                    ${isOnline ? 'ring-green-400' : 'ring-gray-200'}
                                `}>
                                    {user.firstname.charAt(0).toUpperCase() + user.lastname.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full transition-colors
                                ${isOnline ? 'bg-green-500' : 'bg-gray-300'}
                            `}></span>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 min-w-0 pr-2">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`font-semibold truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                    {formatName(user)}
                                </h3>
                                <span className="text-[11px] text-gray-500 font-medium">
                                    {getLastMessageTimeStamp(user._id)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-xs truncate ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                                    {getLastMessage(user._id) || user.email}
                                </p>
                                {unreadCount && (
                                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e74c3c] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                        {unreadCount.props.children}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Start Chat Button for Search Results */}
                        {!allChats.find(chat => chat.members.map(m => m._id).includes(user._id)) && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    className="bg-[#e74c3c] text-white text-[10px] font-bold py-2 px-3 rounded-lg shadow-md hover:bg-[#c0392b] active:scale-95" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startNewChat(user._id);
                                    }}
                                >
                                    START CHAT
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    )
}

export default UserList