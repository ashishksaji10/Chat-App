import { useState } from "react"
import Search from "./Search"
import UserList from "./UserList";


const Sidebar = ({ socket }) => {

  const [searchKey, setSearchKey] = useState('');

  return (
    <div className="app-sidebar">
        <Search 
            searchKey = { searchKey }
            setSearchKey = { setSearchKey }
        />
        <UserList searchKey = { searchKey } socket={socket}/>
    </div>
  )
}

export default Sidebar