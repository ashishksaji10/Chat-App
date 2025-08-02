import { useDispatch, useSelector } from "react-redux";

const Header = () => {
  const { user } = useSelector(state => state.userReducer);

  console.log(user)

  const getFullName = () => {
    let fname = user?.firstname.toUpperCase();
    let lname = user?.lastname.toUpperCase();
    return fname + ' ' + lname;
  }

  const getInitial = () => {
    let f = user?.firstname.toUpperCase()[0];
    let l = user?.lastname.toUpperCase()[0];
    return f + l;
  }

  return (
    <div className="app-header">
        <div className="app-logo">
            <i className="fa fa-comments" aria-hidden="true"></i>
            Quick Chat
            </div>
        <div className="app-user-profile">
            <div className="logged-user-name">{ getFullName() }</div>
            <div className="logged-user-profile-pic">{ getInitial() }</div>
        </div>
    </div>
  )
}

export default Header