import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast';
import { createNewChat } from './../../../apiCalls/Chat';
import { showLoader, hideLoader } from './../../../redux/loaderSlice';
import { setAllChats, setSelectedChat } from './../../../redux/userSlice';

const UserList = ({ searchKey }) => {

    const { allUsers, allChats, user: currentUser } = useSelector(state => state.userReducer);
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
        const chat = allChats.find(chat => chat.members.includes(currentUser._id) &&
        chat.members.includes(searchedUserId));

        if(chat){
            dispatch(setSelectedChat(chat));
        }
    }
    return (
        allUsers
        .filter(user => {
            return ( 
                (
                user.firstname.toLowerCase().includes(searchKey.toLowerCase()) || 
                user.lastname.toLowerCase().includes(searchKey.toLowerCase())) && searchKey
            ) || ( allChats.some(chat => chat.members.includes(user._id)))
        })
        .map(user => {
            return <div class="user-search-filter" onClick={() => openChat(user._id)} key={user._id}>
                <div class="filtered-user">
                    <div class="filter-user-display">
                        {user.profilePic && <img src={user.profilePic} alt="Profile Pic" class="user-profile-image"/>}
                        {!user.profilePic && <div class="user-default-profile-pic">
                            {
                                user.firstname.charAt(0).toUpperCase() +
                                user.lastname.charAt(0).toUpperCase() 
                            }
                        </div>}
                        <div class="filter-user-details">
                            <div class="user-display-name">{user.firstname + " " + user.lastname}</div>
                            <div class="user-display-email">{user.email}</div>
                        </div>
                        { !allChats.find(chat => chat.members.includes(user._id)) &&
                            <div className="user-start-chat">
                                <button class="user-start-chat-btn" onClick={() => startNewChat(user._id)}>
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