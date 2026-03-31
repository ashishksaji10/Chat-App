import moment from 'moment';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { uploadProfilePic } from '../../apiCalls/Users';
import { hideLoader, showLoader } from '../../redux/loaderSlice';
import toast from 'react-hot-toast';
import { setUser } from '../../redux/userSlice';

const Profile = () => {

    const { user } = useSelector(state => state.userReducer);
    const [ image, setImage ] = useState('');
    const dispatch = useDispatch();


    useEffect(() => {
        if(user?.profilePic){
            setImage(user.profilePic);
        }
    }, [user])


    const getInitial = () => {
        let f = user?.firstname.toUpperCase()[0];
        let l = user?.lastname.toUpperCase()[0];
        return f + l;
    }

    const getFullName = () => {
        let fname = user?.firstname.at(0).toUpperCase() + user?.firstname.slice(1).toLowerCase();
        let lname = user?.lastname.at(0).toUpperCase() + user?.lastname.slice(1).toLowerCase();
    
        return fname + " " + lname;
    }

    const onFileSelect = async(e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);

        reader.readAsDataURL(file);

        reader.onloadend = async() => {
            setImage(reader.result);
        }
    }

    const updateProfilePic = async() => {
        try {
            dispatch(showLoader());
            const response = await uploadProfilePic(image);
            dispatch(hideLoader());

            if(response.success){
                toast.success(response.message || "Profile picture updated successfully!");
                dispatch(setUser(response.data))
            }else{
                toast.error(response.message || "Failed to update profile picture.")
            }
        } catch (error) {
            toast.error(error.message || "An unexpected error occurred.")
            dispatch(hideLoader());
        }
    } 

    return (
    <div className="relative max-w-4xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-12 items-center md:items-start transition-all animate-in fade-in zoom-in-95 duration-500">
        {/* Back Button */}
        <button 
            onClick={() => window.location.href = '/'} 
            className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white transition-all shadow-md active:scale-90 group z-20"
            title="Back to Home"
        >
            <i className="fa fa-arrow-left text-xl group-hover:-translate-x-1 transition-transform"></i>
        </button>

        <div className="shrink-0 flex flex-col items-center gap-6 mt-8 md:mt-0">
            <div className="relative group">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-[#e74c3c]/10 shadow-lg relative bg-gray-50 flex items-center justify-center">
                    {image ? (
                        <img src={image} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <span className="text-6xl sm:text-8xl font-bold text-[#e74c3c]">{getInitial()}</span>
                    )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <i className="fa fa-camera text-white text-3xl"></i>
                    <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={onFileSelect}
                        title="Change Profile Picture"
                    />
                </div>
            </div>
            <p className="text-sm text-gray-400 font-medium italic">Click image to change</p>
        </div> 

        <div className="flex-1 w-full space-y-8 py-4">
            <div className="border-b border-gray-100 pb-6 text-center md:text-left">
                <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-2">{getFullName()}</h1>
                <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
                    <i className="fa fa-envelope-o text-[#e74c3c]"></i>
                    {user?.email}
                </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account Since</p>
                    <p className="text-gray-700 font-semibold">{moment(user?.createdAt).format('MMMM DD, YYYY')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-green-500 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Active
                    </p>
                </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button 
                    className={`
                        flex-1 py-4 px-6 rounded-2xl font-bold transition-all shadow-lg active:scale-95
                        ${image !== user?.profilePic ? 'bg-[#e74c3c] text-white hover:bg-[#c0392b] shadow-red-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}
                    `}
                    onClick={updateProfilePic}
                    disabled={image === user?.profilePic}
                >
                    Update Profile Icon
                </button>
                <button 
                    className="px-6 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all active:scale-95 border border-gray-200"
                    onClick={() => window.location.href = '/'}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
    )
}

export default Profile