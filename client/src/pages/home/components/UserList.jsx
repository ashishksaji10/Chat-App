import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast';
import { createNewChat } from './../../../apiCalls/Chat';
import { showLoader, hideLoader } from './../../../redux/loaderSlice';
import { setAllChats, setSelectedChat } from './../../../redux/userSlice';
import moment from 'moment';

const UserList = ({ searchKey }) => {

    const { allUsers, allChats, user: currentUser, selectedChat } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();
    let response = null;
    const startNewChat = async  (searchedUserId) => {
        try {
            dispatch(showLoader())
            response = await createNewChat([currentUser._id, searchedUserId])
            dispatch(hideLoader())

            if(response.success){
                toast.success(response.message);
                const newChat = response.data;
                const updatedChat = [...allChats, newChat];
                dispatch(setAllChats(updatedChat));
                dispatch(setSelectedChat(newChat))
            }
        } catch (error) {
            toast.error(response.error)
            dispatch(hideLoader())
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

    return (
        allUsers
        .filter(user => {
            return ( 
                (
                user.firstname.toLowerCase().includes(searchKey.toLowerCase()) || 
                user.lastname.toLowerCase().includes(searchKey.toLowerCase())) && searchKey
            ) || ( allChats.some(chat => chat.members.map(m => m._id).includes(user._id)))
        })
        .map(user => {
            return <div className="user-search-filter" onClick={() => openChat(user._id)} key={user._id}>
                <div className={ isSelectedChat(user) ? "selected-user" : "filtered-user"}>
                    <div className="filter-user-display">
                        {user.profilePic && <img src={user.profilePic} alt="Profile Pic" className="user-profile-image"/>}
                        {!user.profilePic && <div className={isSelectedChat ? "user-selected-avatar" :"user-default-avatar"}>
                            {
                                user.firstname.charAt(0).toUpperCase() +
                                user.lastname.charAt(0).toUpperCase() 
                            }
                        </div>}
                        <div className="filter-user-details">
                            <div className="user-display-name">{ formatName(user)}</div>
                            <div className="user-display-email">{getLastMessage(user._id) || user.email}</div>
                        </div>
                        <div>
                        { getUnreadMessageCount(user._id) }
                        <div className='last-message-timestamp'>{ getLastMessageTimeStamp(user._id) }</div>
                        </div>
                        { !allChats.find(chat => chat.members.map(m => m._id).includes(user._id)) &&
                            <div className="user-start-chat">
                                <button className="user-start-chat-btn" onClick={() => startNewChat(user._id)}>
                                    Start Chat
                                    </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        })
    )
}

export default UserList