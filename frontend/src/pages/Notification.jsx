import React, { useContext, useEffect, useState } from 'react';
import Nav from '../components/Nav.jsx';
import { authDataContext } from '../context/AuthContext.jsx';
import { userDataContext } from '../context/UserContext.jsx';
import axios from 'axios';
import { 
    HiHandThumbUp,
    HiOutlineChatBubbleOvalLeftEllipsis, 
    HiOutlineTrash,
    HiOutlineBell,
    HiXMark
} from "react-icons/hi2";
import { FiUserCheck } from "react-icons/fi";
import dp from "../assets/dp.webp";
import moment from 'moment';
import { socket } from '../../socket.js';

const Notification = () => {
    const { serverUrl } = useContext(authDataContext);
    const { handleGetProfile, setUnreadNotifications } = useContext(userDataContext);
    const [notificationData, setNotificationData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleGetNotification = async () => {
        setLoading(true);
        try {
            let result = await axios.get(`${serverUrl}/api/notification/get`, { withCredentials: true });
            setNotificationData(result.data || []);
            
            await axios.put(`${serverUrl}/api/notification/mark-read`, {}, { withCredentials: true });
            setUnreadNotifications(0);
        } catch (error) {
            console.log("Get notification error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await axios.delete(`${serverUrl}/api/notification/deleteone/${id}`, { withCredentials: true });
            setNotificationData(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            console.log("Delete notification error:", error);
        }
    };

    const handleClearAllNotification = async () => {
        try {
            await axios.delete(`${serverUrl}/api/notification`, { withCredentials: true });
            setNotificationData([]);
            setUnreadNotifications(0);
        } catch (error) {
            console.log("Clear all notifications error:", error);
        }
    };

    const getNotificationMeta = (type) => {
        switch (type) {
            case "like":
                return {
                    text: "liked your post.",
                    icon: <HiHandThumbUp className="w-3.5 h-3.5 text-[#E73F1E] dark:text-[#F9B637]" />,
                    bg: "bg-[#FB6C00]/10 dark:bg-[#FB6C00]/25"
                };
            case "comment":
                return {
                    text: "commented on your post.",
                    icon: <HiOutlineChatBubbleOvalLeftEllipsis className="w-3.5 h-3.5 text-[#E73F1E] dark:text-[#F9B637]" />,
                    bg: "bg-[#FB6C00]/10 dark:bg-[#FB6C00]/25"
                };
            case "connectionAccepted":
            default:
                return {
                    text: "accepted your connection request.",
                    icon: <FiUserCheck className="w-3.5 h-3.5 text-[#E73F1E] dark:text-[#F9B637]" />,
                    bg: "bg-[#FB6C00]/10 dark:bg-[#FB6C00]/25"
                };
        }
    };

    useEffect(() => {
        handleGetNotification();

        const handleRealtimeNotification = async (newNotif) => {
            if (!newNotif) return;
            setNotificationData(prev => {
                if (prev.some(n => n._id === newNotif._id)) return prev;
                return [newNotif, ...prev];
            });
            try {
                await axios.put(`${serverUrl}/api/notification/mark-read`, {}, { withCredentials: true });
                setUnreadNotifications(0);
            } catch (e) {
                console.log("Mark read error:", e);
            }
        };

        socket.on("newNotification", handleRealtimeNotification);

        return () => {
            socket.off("newNotification", handleRealtimeNotification);
        };
    }, [serverUrl, setUnreadNotifications]);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 pt-20 sm:pt-24 pb-12 px-3 sm:px-6 transition-colors">
            <Nav />

            <div className="max-w-3xl mx-auto space-y-4">
                
                <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-5 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-[#FB6C00]/10 dark:bg-[#FB6C00]/25 text-[#E73F1E] dark:text-[#F9B637] flex items-center justify-center">
                            <HiOutlineBell className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                                Notifications
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Recent interactions on your posts and profile.
                            </p>
                        </div>
                    </div>

                    {!loading && notificationData.length > 0 && (
                        <button 
                            onClick={handleClearAllNotification}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                        >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                            <span>Clear all</span>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] divide-y divide-slate-100 dark:divide-[#2d1c15] overflow-hidden shadow-xs">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 flex items-start gap-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2d1c15] shrink-0"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3.5 bg-slate-200 dark:bg-[#2d1c15] rounded-md w-3/4"></div>
                                    <div className="h-2.5 bg-slate-200 dark:bg-[#2d1c15] rounded-md w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notificationData.length > 0 ? (
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] divide-y divide-slate-100 dark:divide-[#2d1c15] overflow-hidden shadow-xs">
                        {notificationData.map((item) => {
                            const meta = getNotificationMeta(item.type);
                            return (
                                <div 
                                    key={item._id}
                                    className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#2d1c15]/40 transition-colors group"
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        
                                        <div className="relative shrink-0">
                                            <img 
                                                src={item.relatedUser?.profileImage || dp} 
                                                alt={item.relatedUser?.firstName || "User"} 
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15]"
                                            />
                                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${meta.bg} flex items-center justify-center border border-white dark:border-[#17120e]`}>
                                                {meta.icon}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                                                <span 
                                                    onClick={() => item.relatedUser?.userName && handleGetProfile(item.relatedUser.userName)}
                                                    className="font-bold text-slate-900 dark:text-zinc-100 hover:text-[#FB6C00] dark:hover:text-[#F9B637] cursor-pointer transition-colors"
                                                >
                                                    {item.relatedUser ? `${item.relatedUser.firstName} ${item.relatedUser.lastName}` : "Someone"}
                                                </span>{" "}
                                                <span>{meta.text}</span>
                                            </p>

                                            {item.relatedPost && (
                                                <div className="mt-2 p-2 bg-slate-50 dark:bg-[#0f0b09] rounded-md flex items-center gap-2.5 border border-slate-200 dark:border-[#2d1c15] max-w-md">
                                                    {item.relatedPost.image && (
                                                        <img 
                                                            src={item.relatedPost.image} 
                                                            alt="Post" 
                                                            className="w-8 h-8 rounded-md object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                                                        />
                                                    )}
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 flex-1">
                                                        {item.relatedPost.description || "Post"}
                                                    </p>
                                                </div>
                                            )}

                                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                                                {moment(item.createdAt).fromNow()}
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleDeleteNotification(item._id)}
                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#2d1c15] transition-colors"
                                        title="Dismiss"
                                    >
                                        <HiXMark className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] p-8 text-center text-slate-500 dark:text-zinc-400 text-xs">
                        You have no unread notifications.
                    </div>
                )}

            </div>
        </div>
    );
};

export default Notification;
