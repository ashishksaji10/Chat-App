import { useState } from "react"
import Search from "./Search"
import UserList from "./UserList";


const Sidebar = ({ socket, onlineUser }) => {

  const [searchKey, setSearchKey] = useState('');

  return (
    <aside className="w-full md:w-[320px] lg:w-[380px] flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <Search 
            searchKey = { searchKey }
            setSearchKey = { setSearchKey }
        />
        <div className="flex-1 overflow-y-auto">
            <UserList 
                searchKey = { searchKey }
                socket={socket} 
                onlineUser={onlineUser}
            />
        </div>
    </aside>
  )
}

export default Sidebar