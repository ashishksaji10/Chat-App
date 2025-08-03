import { useSelector } from "react-redux"

const ChatArea = () => {

  const { selectedChat, user } = useSelector(state => state.userReducer);
  const selectedUser = selectedChat.members.find( u => u._id !== user._id) 

  return ( 
    <>
      { selectedChat && <div class="app-chat-area">
          <div class="app-chat-area-header">
              { selectedUser.firstname + ' ' + selectedUser.lastname}
          </div>
          <div>
            CHAT AREA
          </div>
          <div>
              SEND MESSAGE
          </div>
        </div> }
    </>
  )
}

export default ChatArea