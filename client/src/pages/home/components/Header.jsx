import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser, setSelectedChat } from "../../../redux/userSlice";

const Header = ({socket}) => {
  const { user } = useSelector(state => state.userReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getFullName = () => {
    let fname = user?.firstname.at(0).toUpperCase() + user?.firstname.slice(1).toLowerCase();
    let lname = user?.lastname.at(0).toUpperCase() + user?.lastname.slice(1).toLowerCase();

    return fname + " " + lname;
  }

  const getInitial = () => {
    let f = user?.firstname.toUpperCase()[0];
    let l = user?.lastname.toUpperCase()[0];
    return f + l;
  }

  const logout = () => {
      socket.emit('user-offline', user._id);
      localStorage.removeItem('token');
      dispatch(setUser(null));
      dispatch(setSelectedChat(null));
      navigate('/login');
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
        <div className="bg-[#e74c3c] p-2 rounded-lg">
          <i className="fa fa-comments text-white text-2xl" aria-hidden="true"></i>
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">Quick Chat</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-4 border-r border-gray-100 mr-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-700 leading-tight">{getFullName()}</p>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
          <div 
            className="w-10 h-10 rounded-full bg-[#e74c3c] text-white flex items-center justify-center font-bold relative cursor-pointer ring-2 ring-transparent hover:ring-[#e74c3c] transition-all overflow-hidden"
            onClick={() => navigate('/profile')}
          >
            {user?.profilePic ? (
              <img src={user?.profilePic} alt="profile-pic" className="w-full h-full object-cover" />
            ) : (
              getInitial()
            )}
          </div>
        </div>
        
        <button 
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95" 
          onClick={logout}
          title="Logout"
        >
          <i className="fa fa-power-off text-xl"></i>
        </button>
      </div>
    </header>
  )
}

export default Header