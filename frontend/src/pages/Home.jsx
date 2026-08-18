import React, { useContext, useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav.jsx';
import dp from "../assets/dp.webp";
import { 
    HiOutlinePhoto, 
    HiPencilSquare,
    HiXMark,
    HiOutlineUserGroup
} from "react-icons/hi2";
import { FiMapPin } from "react-icons/fi";
import { userDataContext } from '../context/UserContext.jsx';
import axios from 'axios';
import { authDataContext } from '../context/AuthContext.jsx';
import EditProfile from '../components/EditProfile.jsx';
import Post from '../components/Post.jsx';
import ConnectButton from '../components/ConnectButton.jsx';

function Home() {
    const { 
        userData, 
        edit, 
        setEdit, 
        postData, 
        setPostData, 
        loadingPosts,
        handleGetProfile 
    } = useContext(userDataContext);
    
    const { serverUrl } = useContext(authDataContext);

    const [frontendImage, setFrontendImage] = useState("");
    const [backendImage, setBackendImage] = useState(null);
    const [description, setDescription] = useState("");
    const [uploadPost, setUploadPost] = useState(false);
    const [posting, setPosting] = useState(false);
    const [suggestedUsers, setSuggestedUsers] = useState([]);

    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFrontendImage(URL.createObjectURL(file));
            setBackendImage(file);
        }
    };

    const handleRemoveImage = () => {
        setFrontendImage("");
        setBackendImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!description.trim() && !backendImage) return;

        setPosting(true);
        try {
            const formData = new FormData();
            formData.append("description", description);
            if (backendImage) {
                formData.append("image", backendImage);
            }

            const result = await axios.post(`${serverUrl}/api/post/create`, formData, {
                withCredentials: true
            });

            if (result.data) {
                setPostData((prevPosts) => {
                    if (prevPosts.some(p => p._id === result.data._id)) {
                        return prevPosts;
                    }
                    return [result.data, ...prevPosts];
                });
            }

            setDescription("");
            setFrontendImage("");
            setBackendImage(null);
            setUploadPost(false);

        } catch (error) {
            console.log("Create post error:", error);
        } finally {
            setPosting(false);
        }
    };

    const fetchSuggestedUsers = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/suggestedusers`, {
                withCredentials: true
            });
            setSuggestedUsers(result.data || []);
        } catch (error) {
            console.log("Suggested users error:", error);
        }
    };

    useEffect(() => {
        fetchSuggestedUsers();
    }, []);

    if (!userData) return null;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 pt-20 pb-12 px-4 sm:px-6 transition-colors">
            <Nav />
            {edit && <EditProfile />}

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <aside className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] shadow-xs">
                        
                        <div className="h-20 w-full rounded-t-lg bg-gradient-to-r from-[#E73F1E] via-[#FB6C00] to-[#F9B637] relative overflow-hidden">
                            {userData.coverImage && (
                                <img 
                                    src={userData.coverImage} 
                                    alt="Cover" 
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        <div className="px-4 pb-4 pt-0 relative">
                            
                            <div className="-mt-10 mb-2.5 flex items-center justify-between relative z-20">
                                <div 
                                    onClick={() => setEdit(true)}
                                    className="w-16 h-16 rounded-full border-2 border-white dark:border-[#17120e] shadow-sm overflow-hidden bg-white dark:bg-[#17120e] cursor-pointer"
                                >
                                    <img 
                                        src={userData.profileImage || dp} 
                                        alt={userData.firstName} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="mt-1">
                                <h3 
                                    onClick={() => handleGetProfile(userData.userName)}
                                    className="text-sm font-bold text-slate-900 dark:text-zinc-100 hover:text-[#FB6C00] dark:hover:text-[#F9B637] cursor-pointer transition-colors"
                                >
                                    {userData.firstName} {userData.lastName}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                                    {userData.headline || "Professional & Community Member"}
                                </p>

                                {userData.location && (
                                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-zinc-500 mt-1.5">
                                        <FiMapPin className="w-3.5 h-3.5" />
                                        <span>{userData.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#2d1c15] flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Connections</span>
                                <span className="font-bold text-[#E73F1E] dark:text-[#F9B637] bg-[#FB6C00]/10 px-2 py-0.5 rounded-md">
                                    {userData.connection?.length || 0}
                                </span>
                            </div>

                            <button 
                                onClick={() => setEdit(true)}
                                className="w-full mt-3 py-1.5 px-3 rounded-md border border-slate-200 dark:border-[#2d1c15] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#2d1c15] hover:text-[#E73F1E] dark:hover:text-[#F9B637] hover:border-[#FB6C00] transition-colors flex items-center justify-center gap-1.5"
                            >
                                <HiPencilSquare className="w-3.5 h-3.5" />
                                <span>Edit Profile</span>
                            </button>
                        </div>
                    </div>
                </aside>

                <section className="lg:col-span-6 space-y-4">
                    
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <img 
                                src={userData.profileImage || dp} 
                                alt={userData.firstName} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                            />
                            <button 
                                onClick={() => setUploadPost(true)}
                                className="flex-1 bg-slate-100 dark:bg-[#0f0b09] hover:bg-slate-200/80 dark:hover:bg-[#2d1c15] text-left text-xs sm:text-sm text-slate-500 dark:text-zinc-400 px-3.5 py-2.5 rounded-md border border-transparent dark:border-[#2d1c15] transition-colors"
                            >
                                Start a post or share an update...
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-[#2d1c15]">
                            <button 
                                onClick={() => {
                                    setUploadPost(true);
                                    setTimeout(() => fileInputRef.current?.click(), 100);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-[#E73F1E] dark:hover:text-[#F9B637] hover:bg-slate-100 dark:hover:bg-[#2d1c15] transition-colors"
                            >
                                <HiOutlinePhoto className="w-4 h-4 text-[#FB6C00] dark:text-[#F9B637]" />
                                <span>Photo</span>
                            </button>
                            
                            <button 
                                onClick={() => setUploadPost(true)}
                                className="px-4 py-1.5 rounded-md text-xs font-bold bg-[#FB6C00] hover:bg-[#E73F1E] text-white shadow-xs transition-colors"
                            >
                                Post
                            </button>
                        </div>
                    </div>

                    {loadingPosts ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-5 shadow-xs animate-pulse space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2d1c15]"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-3.5 bg-slate-200 dark:bg-[#2d1c15] rounded w-1/3"></div>
                                            <div className="h-2.5 bg-slate-200 dark:bg-[#2d1c15] rounded w-1/4"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="h-3 bg-slate-200 dark:bg-[#2d1c15] rounded w-full"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-[#2d1c15] rounded w-5/6"></div>
                                    </div>
                                    <div className="h-44 bg-slate-200 dark:bg-[#2d1c15] rounded-md mt-2"></div>
                                </div>
                            ))}
                        </div>
                    ) : postData.length > 0 ? (
                        <div className="space-y-4">
                            {postData.map((post) => (
                                <Post 
                                    key={post._id}
                                    id={post._id}
                                    author={post.author}
                                    description={post.description}
                                    image={post.image}
                                    like={post.like}
                                    comment={post.comment}
                                    createdAt={post.createdAt}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-8 text-center space-y-2">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">No posts on your feed yet</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                                Be the first one to start a conversation or share an update!
                            </p>
                            <button 
                                onClick={() => setUploadPost(true)}
                                className="mt-2 px-4 py-1.5 rounded-md text-xs font-bold bg-[#FB6C00] hover:bg-[#E73F1E] text-white shadow-xs transition-colors"
                            >
                                Create First Post
                            </button>
                        </div>
                    )}
                </section>

                <aside className="lg:col-span-3 hidden lg:block space-y-4">
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-4 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                                <HiOutlineUserGroup className="w-4 h-4 text-[#FB6C00] dark:text-[#F9B637]" />
                                <span>Suggested For You</span>
                            </h3>
                        </div>

                        {suggestedUsers.length > 0 ? (
                            <div className="space-y-3">
                                {suggestedUsers.slice(0, 5).map((user) => (
                                    <div 
                                        key={user._id}
                                        className="flex items-center justify-between gap-2.5 p-1 rounded-md hover:bg-slate-50 dark:hover:bg-[#2d1c15]/50 transition-colors"
                                    >
                                        <div 
                                            onClick={() => handleGetProfile(user.userName)}
                                            className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                                        >
                                            <img 
                                                src={user.profileImage || dp} 
                                                alt={user.firstName} 
                                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate hover:text-[#FB6C00] dark:hover:text-[#F9B637] transition-colors">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                                    {user.headline || `@${user.userName}`}
                                                </p>
                                            </div>
                                        </div>
                                        <ConnectButton userId={user._id} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 dark:text-zinc-500 py-2 text-center">
                                No suggested connections right now.
                            </p>
                        )}
                    </div>

                    <div className="p-2 text-[11px] text-slate-400 dark:text-zinc-500 text-center space-y-1">
                        <p>© 2026 Conexis Network</p>
                    </div>
                </aside>

            </main>

            {uploadPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        onClick={() => setUploadPost(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                    ></div>

                    <div className="relative w-full max-w-lg bg-white dark:bg-[#17120e] rounded-lg shadow-2xl border border-slate-200 dark:border-[#2d1c15] z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#2d1c15] flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Create Post</h3>
                            <button 
                                onClick={() => setUploadPost(false)}
                                className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-[#2d1c15] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 flex items-center justify-center transition-colors"
                            >
                                <HiXMark className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-4 pt-3 flex items-center gap-2.5">
                            <img 
                                src={userData.profileImage || dp} 
                                alt={userData.firstName} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15]"
                            />
                            <div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                                    {userData.firstName} {userData.lastName}
                                </h4>
                                <span className="inline-block text-[10px] font-medium text-[#E73F1E] dark:text-[#F9B637] bg-[#FB6C00]/10 px-2 py-0.5 rounded-sm">
                                    Public
                                </span>
                            </div>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-3">
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What would you like to share?"
                                rows={4}
                                className="w-full text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm leading-relaxed border-0 focus:outline-none resize-none bg-transparent"
                                autoFocus
                            />

                            {frontendImage && (
                                <div className="relative rounded-md overflow-hidden border border-slate-200 dark:border-[#2d1c15] max-h-60 bg-slate-50 dark:bg-[#0f0b09] flex items-center justify-center">
                                    <img 
                                        src={frontendImage} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover max-h-60"
                                    />
                                    <button 
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 p-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-md transition-colors"
                                    >
                                        <HiXMark className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            <input 
                                type="file" 
                                accept="image/*" 
                                hidden 
                                ref={fileInputRef} 
                                onChange={handleImageChange}
                            />
                        </div>

                        <div className="px-4 py-3 bg-slate-50 dark:bg-[#110d0a] border-t border-slate-200 dark:border-[#2d1c15] flex items-center justify-between">
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#17120e] border border-transparent hover:border-slate-200 dark:hover:border-[#2d1c15] transition-colors"
                            >
                                <HiOutlinePhoto className="w-4 h-4 text-[#FB6C00] dark:text-[#F9B637]" />
                                <span>{frontendImage ? "Change photo" : "Add photo"}</span>
                            </button>

                            <button 
                                onClick={handleUpload}
                                disabled={posting || (!description.trim() && !backendImage)}
                                className="px-4 py-1.5 rounded-md text-xs font-bold bg-[#FB6C00] hover:bg-[#E73F1E] text-white shadow-xs hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {posting ? "Posting..." : "Publish"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
