import React, { useContext, useState, useEffect } from 'react';
import Nav from '../components/Nav.jsx';
import { authDataContext } from '../context/AuthContext.jsx';
import { userDataContext } from '../context/userContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dp from "../assets/dp.webp";
import { 
    HiOutlineCheck, 
    HiOutlineXMark, 
    HiOutlineUserGroup, 
    HiOutlineUserPlus,
    HiOutlineTrash,
    HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";

function Network() {
    const navigate = useNavigate();
    const { serverUrl } = useContext(authDataContext);
    const { handleGetProfile, setPendingConnections } = useContext(userDataContext);
    
    const [invitations, setInvitations] = useState([]);
    const [myConnections, setMyConnections] = useState([]);
    const [activeTab, setActiveTab] = useState("invitations");
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingConnections, setLoadingConnections] = useState(true);

    const handleGetRequests = async () => {
        setLoadingRequests(true);
        try {
            let result = await axios.get(`${serverUrl}/api/connection/requests`, { withCredentials: true });
            const list = result.data || [];
            setInvitations(list);
            setPendingConnections(list.length);
        } catch (error) {
            console.log("Get invitations error:", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleGetMyConnections = async () => {
        setLoadingConnections(true);
        try {
            let result = await axios.get(`${serverUrl}/api/connection`, { withCredentials: true });
            setMyConnections(result.data || []);
        } catch (error) {
            console.log("Get my connections error:", error);
        } finally {
            setLoadingConnections(false);
        }
    };

    const handleAcceptConnection = async (requestId) => {
        try {
            await axios.put(`${serverUrl}/api/connection/accept/${requestId}`, {}, { withCredentials: true });
            setInvitations(prev => {
                const updated = prev.filter(con => con._id !== requestId);
                setPendingConnections(updated.length);
                return updated;
            });
            handleGetMyConnections();
        } catch (error) {
            console.log("Accept connection error:", error);
        }
    };

    const handleRejectConnection = async (requestId) => {
        try {
            await axios.put(`${serverUrl}/api/connection/reject/${requestId}`, {}, { withCredentials: true });
            setInvitations(prev => {
                const updated = prev.filter(con => con._id !== requestId);
                setPendingConnections(updated.length);
                return updated;
            });
        } catch (error) {
            console.log("Reject connection error:", error);
        }
    };

    const handleRemoveConnection = async (targetUserId) => {
        try {
            await axios.delete(`${serverUrl}/api/connection/remove/${targetUserId}`, { withCredentials: true });
            setMyConnections(prev => prev.filter(con => con._id !== targetUserId));
        } catch (error) {
            console.log("Remove connection error:", error);
        }
    };

    useEffect(() => {
        handleGetRequests();
        handleGetMyConnections();
    }, []);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 pt-20 pb-12 px-4 sm:px-6 transition-colors">
            <Nav />

            <div className="max-w-4xl mx-auto space-y-4">
                
                <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
                            My Network
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Manage invitations and view your professional connections.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0f0b09] p-1 rounded-md">
                        <button
                            onClick={() => setActiveTab("invitations")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                                activeTab === "invitations"
                                    ? "bg-white dark:bg-[#2d1c15] text-[#E73F1E] dark:text-[#F9B637] shadow-xs"
                                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                            }`}
                        >
                            <HiOutlineUserPlus className="w-4 h-4" />
                            <span>Invitations</span>
                            {!loadingRequests && invitations.length > 0 && (
                                <span className="bg-[#FB6C00] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                    {invitations.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("connections")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                                activeTab === "connections"
                                    ? "bg-white dark:bg-[#2d1c15] text-[#E73F1E] dark:text-[#F9B637] shadow-xs"
                                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                            }`}
                        >
                            <HiOutlineUserGroup className="w-4 h-4" />
                            <span>Connections</span>
                            {!loadingConnections && (
                                <span className="bg-slate-200 dark:bg-[#2d1c15] text-slate-700 dark:text-zinc-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                    {myConnections.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {activeTab === "invitations" && (
                    <div className="space-y-3">
                        {loadingRequests ? (
                            <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] divide-y divide-slate-100 dark:divide-[#2d1c15] overflow-hidden shadow-xs">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 flex items-center justify-between gap-3 animate-pulse">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2d1c15]"></div>
                                            <div className="space-y-2 flex-1 max-w-xs">
                                                <div className="h-3.5 bg-slate-200 dark:bg-[#2d1c15] rounded w-3/4"></div>
                                                <div className="h-2.5 bg-slate-200 dark:bg-[#2d1c15] rounded w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-16 h-7 bg-slate-200 dark:bg-[#2d1c15] rounded-md"></div>
                                            <div className="w-16 h-7 bg-slate-200 dark:bg-[#2d1c15] rounded-md"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : invitations.length > 0 ? (
                            <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] divide-y divide-slate-100 dark:divide-[#2d1c15] overflow-hidden shadow-xs">
                                {invitations.map((req) => (
                                    <div 
                                        key={req._id}
                                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#2d1c15]/40"
                                    >
                                        <div 
                                            onClick={() => req.sender?.userName && handleGetProfile(req.sender.userName)}
                                            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                                        >
                                            <img 
                                                src={req.sender?.profileImage || dp} 
                                                alt={req.sender?.firstName || "User"}
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-100 group-hover:text-[#FB6C00] dark:group-hover:text-[#F9B637] transition-colors truncate">
                                                    {req.sender ? `${req.sender.firstName} ${req.sender.lastName}` : "Member"}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                                    {req.sender?.headline || `@${req.sender?.userName}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                            <button 
                                                onClick={() => handleRejectConnection(req._id)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-[#2d1c15] hover:bg-slate-200 dark:hover:bg-[#E73F1E]/40 transition-colors"
                                            >
                                                <HiOutlineXMark className="w-3.5 h-3.5" />
                                                <span>Decline</span>
                                            </button>

                                            <button 
                                                onClick={() => handleAcceptConnection(req._id)}
                                                className="flex items-center gap-1 px-4 py-1.5 rounded-md text-xs font-bold text-white bg-[#FB6C00] hover:bg-[#E73F1E] shadow-xs transition-colors"
                                            >
                                                <HiOutlineCheck className="w-3.5 h-3.5" />
                                                <span>Accept</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-8 text-center text-slate-500 dark:text-zinc-400 text-xs">
                                No pending invitations.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "connections" && (
                    <div>
                        {loadingConnections ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-4 shadow-xs animate-pulse space-y-3">
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2d1c15] shrink-0"></div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 bg-slate-200 dark:bg-[#2d1c15] rounded w-3/4"></div>
                                                <div className="h-2.5 bg-slate-200 dark:bg-[#2d1c15] rounded w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 dark:border-[#2d1c15] flex gap-2">
                                            <div className="h-7 bg-slate-200 dark:bg-[#2d1c15] rounded-md flex-1"></div>
                                            <div className="h-7 bg-slate-200 dark:bg-[#2d1c15] rounded-md w-16"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : myConnections.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {myConnections.map((user) => (
                                    <div 
                                        key={user._id}
                                        className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-4 flex flex-col justify-between shadow-xs hover:border-[#FB6C00] transition-colors"
                                    >
                                        <div className="flex items-start gap-2.5 mb-3">
                                            <img 
                                                src={user.profileImage || dp} 
                                                alt={user.firstName} 
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h4 
                                                    onClick={() => handleGetProfile(user.userName)}
                                                    className="text-xs font-bold text-slate-800 dark:text-zinc-100 hover:text-[#FB6C00] dark:hover:text-[#F9B637] cursor-pointer transition-colors truncate"
                                                >
                                                    {user.firstName} {user.lastName}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                                                    {user.headline || `@${user.userName}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-[#2d1c15]">
                                            <button 
                                                onClick={() => navigate(`/chat/${user._id}`)}
                                                className="flex-1 py-1 px-2 rounded-md bg-[#FB6C00] hover:bg-[#E73F1E] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                                            >
                                                <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
                                                <span>Message</span>
                                            </button>

                                            <button 
                                                onClick={() => handleGetProfile(user.userName)}
                                                className="py-1 px-2.5 rounded-md border border-slate-200 dark:border-[#2d1c15] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#2d1c15] transition-colors"
                                            >
                                                Profile
                                            </button>

                                            <button 
                                                onClick={() => handleRemoveConnection(user._id)}
                                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                title="Disconnect"
                                            >
                                                <HiOutlineTrash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-8 text-center text-slate-500 dark:text-zinc-400 text-xs">
                                No connections in your network yet.
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Network;
