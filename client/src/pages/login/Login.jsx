import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../apiCalls/Auth";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";

const Login = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const onFormSubmit = async (e) => {
    e.preventDefault();
    let response = null;
    try {
      dispatch(showLoader());
      response = await loginUser(user);
      dispatch(hideLoader());
      if (response.success) {
        toast.success(response.message || "Login successful!");
        localStorage.setItem("token", response.token);
        window.location.href = "/";
      } else {
        toast.error(response.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message || "Something went wrong. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative">
      <div className="absolute inset-0 bg-[url('/images/quick-chat-app-background.jpg')] bg-no-repeat bg-cover z-[-2]"></div>
      <div className="absolute inset-0 bg-[#e74c3c] opacity-70 z-[-1]"></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] p-8 mx-4">
        <div className="text-center pb-6">
          <h1 className="text-3xl font-bold text-gray-800">Login Here</h1>
        </div>
        <form onSubmit={onFormSubmit} className="space-y-4">
          <input
            className="w-full bg-gray-100 border-none outline-none p-4 rounded-lg focus:ring-2 focus:ring-[#e74c3c] transition-all"
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => {
              setUser({ ...user, email: e.target.value });
            }}
          />
          <input
            className="w-full bg-gray-100 border-none outline-none p-4 rounded-lg focus:ring-2 focus:ring-[#e74c3c] transition-all"
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={(e) => {
              setUser({ ...user, password: e.target.value });
            }}
          />
          <button className="bg-[#e74c3c] text-white text-lg font-semibold rounded-lg py-3 px-4 w-full mt-2 hover:bg-[#c0392b] transition-colors active:scale-[0.98]">
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">
            Don't have an account yet?
            <Link to="/signup" className="text-blue-500 hover:underline ml-1 font-medium">Signup Here</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
