import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import dp from "../assets/dp.webp";
import { 
    HiPencilSquare, 
    HiOutlineAcademicCap, 
    HiOutlineBriefcase, 
    HiOutlineSparkles,
    HiOutlineDocumentText,
    HiOutlineMapPin,
    HiOutlineUserGroup,
    HiOutlinePlus,
    HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";
import { FiCamera } from "react-icons/fi";
import EditProfile from '../components/EditProfile.jsx';
import { userDataContext } from '../context/UserContext.jsx';
import Post from '../components/Post.jsx';
import ConnectButton from '../components/ConnectButton.jsx';

function Profile() {
    const navigate = useNavigate();
    const { 
        userData, 
        edit, 
        setEdit, 
        postData, 
        profileData 
    } = useContext(userDataContext);

    const currentProfile = profileData || userData;

    const profilePosts = postData.filter(
        (post) => post.author?._id === currentProfile?._id || post.author === currentProfile?._id
    );

    const isOwnProfile = userData?._id && currentProfile?._id === userData._id;
    const isConnected = userData?.connection && currentProfile?._id && (
        userData.connection.includes(currentProfile._id) || 
        (typeof userData.connection[0] === 'object' && userData.connection.some(c => c._id === currentProfile._id))
    );

    if (!currentProfile) return null;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 pt-20 pb-16 px-4 sm:px-6 transition-colors">
            <Nav />
            {edit && <EditProfile />}

            <div className="max-w-4xl mx-auto space-y-4">
                
                <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] shadow-xs">
                    
                    <div className="h-36 sm:h-48 w-full rounded-t-lg bg-gradient-to-r from-[#E73F1E] via-[#FB6C00] to-[#F9B637] relative overflow-hidden">
                        {currentProfile.coverImage && (
                            <img 
                                src={currentProfile.coverImage} 
                                alt="Cover banner" 
                                className="w-full h-full object-cover"
                            />
                        )}
                        {isOwnProfile && (
                            <button 
                                onClick={() => setEdit(true)}
                                className="absolute right-3 top-3 p-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-md transition-colors"
                                title="Change cover photo"
                            >
                                <FiCamera className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="px-6 pb-6 pt-0 relative">
                        
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-12 sm:-mt-14 mb-4 relative z-20">
                            <div 
                                onClick={() => isOwnProfile && setEdit(true)}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white dark:border-[#17120e] shadow-xs overflow-hidden bg-white dark:bg-[#17120e] relative group cursor-pointer"
                            >
                                <img 
                                    src={currentProfile.profileImage || dp} 
                                    alt={currentProfile.firstName} 
                                    className="w-full h-full object-cover"
                                />
                                {isOwnProfile && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                        <FiCamera className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-end">
                                {isOwnProfile ? (
                                    <button 
                                        onClick={() => setEdit(true)}
                                        className="px-4 py-1.5 rounded-md border border-slate-200 dark:border-[#2d1c15] hover:border-[#FB6C00] text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-[#E73F1E] dark:hover:text-[#F9B637] bg-white dark:bg-[#1f1712] hover:bg-slate-50 dark:hover:bg-[#2d1c15] transition-colors flex items-center gap-1.5"
                                    >
                                        <HiPencilSquare className="w-3.5 h-3.5" />
                                        <span>Edit Profile</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <ConnectButton userId={currentProfile._id} />
                                        {isConnected && (
                                            <button 
                                                onClick={() => navigate(`/chat/${currentProfile._id}`)}
                                                className="px-3.5 py-1.5 rounded-md bg-[#FB6C00] hover:bg-[#E73F1E] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                                            >
                                                <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
                                                <span>Message</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                                    {currentProfile.firstName} {currentProfile.lastName}
                                </h1>
                                <span className="text-xs font-semibold text-[#E73F1E] dark:text-[#F9B637] bg-[#FB6C00]/10 px-2 py-0.5 rounded-md">
                                    @{currentProfile.userName}
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                                {currentProfile.headline || "Professional & Community Member"}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 pt-1">
                                {currentProfile.location && (
                                    <div className="flex items-center gap-1">
                                        <HiOutlineMapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                        <span>{currentProfile.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <HiOutlineUserGroup className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                    <span className="font-bold text-slate-700 dark:text-zinc-200">
                                        {currentProfile.connection?.length || 0}
                                    </span>
                                    <span>connections</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {((currentProfile.skills && currentProfile.skills.length > 0) || isOwnProfile) && (
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <HiOutlineSparkles className="w-4 h-4 text-[#FB6C00] dark:text-[#F9B637]" />
                                <span>Skills</span>
                            </h2>
                            {isOwnProfile && (
                                <button 
                                    onClick={() => setEdit(true)}
                                    className="text-xs font-bold text-[#FB6C00] dark:text-[#F9B637] hover:text-[#E73F1E] flex items-center gap-1"
                                >
                                    <HiOutlinePlus className="w-3 h-3" />
                                    <span>Add / Edit</span>
                                </button>
                            )}
                        </div>

                        {currentProfile.skills && currentProfile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {currentProfile.skills.map((skill, index) => (
                                    <span 
                                        key={index}
                                        className="px-2.5 py-1 bg-slate-100 dark:bg-[#1f1712] text-slate-700 dark:text-zinc-300 rounded-md text-xs font-semibold border border-slate-200 dark:border-[#2d1c15]"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 dark:text-zinc-500">No skills added yet.</p>
                        )}
                    </div>
                )}

                {((currentProfile.experience && currentProfile.experience.length > 0) || isOwnProfile) && (
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <HiOutlineBriefcase className="w-4 h-4 text-[#FB6C00] dark:text-[#F9B637]" />
                                <span>Experience</span>
                            </h2>
                            {isOwnProfile && (
                                <button 
                                    onClick={() => setEdit(true)}
                                    className="text-xs font-bold text-[#FB6C00] dark:text-[#F9B637] hover:text-[#E73F1E] flex items-center gap-1"
                                >
                                    <HiOutlinePlus className="w-3 h-3" />
                                    <span>Add / Edit</span>
                                </button>
                            )}
                        </div>

                        {currentProfile.experience && currentProfile.experience.length > 0 ? (
                            <div className="space-y-3 pt-1">
                                {currentProfile.experience.map((exp, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-slate-50 dark:bg-[#0f0b09] border border-slate-200 dark:border-[#2d1c15]">
                                        <div className="w-8 h-8 rounded-md bg-[#FB6C00]/10 text-[#E73F1E] dark:text-[#F9B637] flex items-center justify-center shrink-0">
                                            <HiOutlineBriefcase className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100">{exp.title}</h3>
                                            <p className="text-xs font-semibold text-[#E73F1E] dark:text-[#F9B637]">{exp.company}</p>
                                            {exp.description && (
                                                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{exp.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 dark:text-zinc-500">No experience listed yet.</p>
                        )}
                    </div>
                )}

                {((currentProfile.education && currentProfile.education.length > 0) || isOwnProfile) && (
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <HiOutlineAcademicCap className="w-4 h-4 text-[#FB6C00] dark:text-[#F9B637]" />
                                <span>Education</span>
                            </h2>
                            {isOwnProfile && (
                                <button 
                                    onClick={() => setEdit(true)}
                                    className="text-xs font-bold text-[#FB6C00] dark:text-[#F9B637] hover:text-[#E73F1E] flex items-center gap-1"
                                >
                                    <HiOutlinePlus className="w-3 h-3" />
                                    <span>Add / Edit</span>
                                </button>
                            )}
                        </div>

                        {currentProfile.education && currentProfile.education.length > 0 ? (
                            <div className="space-y-3 pt-1">
                                {currentProfile.education.map((edu, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-slate-50 dark:bg-[#0f0b09] border border-slate-200 dark:border-[#2d1c15]">
                                        <div className="w-8 h-8 rounded-md bg-[#FB6C00]/10 text-[#E73F1E] dark:text-[#F9B637] flex items-center justify-center shrink-0">
                                            <HiOutlineAcademicCap className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100">{edu.college}</h3>
                                            <p className="text-xs font-semibold text-[#E73F1E] dark:text-[#F9B637]">{edu.degree} in {edu.fieldOfStudy}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 dark:text-zinc-500">No education listed yet.</p>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-4 flex items-center justify-between shadow-xs">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <HiOutlineDocumentText className="w-4 h-4 text-[#FB6C00] dark:text-[#F9B637]" />
                            <span>Posts ({profilePosts.length})</span>
                        </h2>
                    </div>

                    {profilePosts.length > 0 ? (
                        <div className="space-y-4">
                            {profilePosts.map((post) => (
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
                        <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                            No posts published yet.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Profile;
