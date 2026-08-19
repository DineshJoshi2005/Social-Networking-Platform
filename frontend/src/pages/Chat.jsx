import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { authDataContext } from '../context/AuthContext.jsx';
import { userDataContext } from '../context/UserContext.jsx';
import ConnectButton from '../components/ConnectButton.jsx';
import axios from 'axios';
import dp from "../assets/dp.webp";
import { socket } from '../../socket.js';
import { 
    HiPaperAirplane, 
    HiOutlineChatBubbleLeftRight,
    HiOutlineMagnifyingGlass,
    HiOutlineArrowLeft,
    HiOutlineUser,
    HiOutlineExclamationCircle
} from "react-icons/hi2";
import moment from 'moment';

function Chat() {
    const { userId: urlUserId } = useParams();
    const navigate = useNavigate();
    const { serverUrl } = useContext(authDataContext);
    const { 
        userData, 
        handleGetProfile,
        fetchBadgeCounts
    } = useContext(userDataContext);

    const [connections, setConnections] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingConnections, setLoadingConnections] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isUserConnected = (userId) => {
        if (!userId) return false;
        return connections.some(c => c._id === userId);
    };

    const fetchConnections = async () => {
        setLoadingConnections(true);
        try {
            const result = await axios.get(`${serverUrl}/api/connection`, { withCredentials: true });
            const list = result.data || [];
            setConnections(list);

            if (urlUserId) {
                const target = list.find(c => c._id === urlUserId);
                if (target) {
                    setSelectedUser(target);
                } else {
                    try {
                        const userRes = await axios.get(`${serverUrl}/api/user/profile/${urlUserId}`, { withCredentials: true });
                        if (userRes.data) {
                            setSelectedUser(userRes.data);
                        }
                    } catch (e) {
                        console.log("Fetch user error:", e);
                    }
                }
            } else if (list.length > 0 && !selectedUser && window.innerWidth > 768) {
                setSelectedUser(list[0]);
            }
        } catch (error) {
            console.log("Fetch connections error:", error);
        } finally {
            setLoadingConnections(false);
        }
    };

    const fetchMessages = async (targetUserId) => {
        if (!targetUserId) return;
        setLoadingMessages(true);
        setSendError("");
        try {
            const result = await axios.get(`${serverUrl}/api/message/${targetUserId}`, { withCredentials: true });
            setMessages(result.data || []);

            await axios.post(`${serverUrl}/api/message/seen/${targetUserId}`, {}, { withCredentials: true });
            fetchBadgeCounts();
        } catch (error) {
            console.log("Fetch messages error:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedUser || sending) return;

        const messageText = inputMessage.trim();
        const tempId = `temp-${Date.now()}`;
        setSendError("");

        const optimisticMessage = {
            _id: tempId,
            sender: userData,
            receiver: selectedUser,
            message: messageText,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setInputMessage("");
        setSending(true);

        try {
            const result = await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`, {
                message: messageText
            }, { withCredentials: true });

            if (result.data) {
                setMessages(prev => {
                    if (prev.some(m => m._id === result.data._id)) {
                        return prev.filter(m => m._id !== tempId);
                    }
                    return prev.map(m => m._id === tempId ? result.data : m);
                });
            }
        } catch (error) {
            console.log("Send message error:", error);
            setMessages(prev => prev.filter(m => m._id !== tempId));
            const errMsg = error.response?.data?.message || "Failed to send message";
            setSendError(errMsg);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [urlUserId]);

    useEffect(() => {
        if (selectedUser?._id) {
            fetchMessages(selectedUser._id);
        } else {
            setMessages([]);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (userData?._id) {
            socket.emit("register", userData._id);
        }

        const handleNewMessage = async (newMsg) => {
            if (!newMsg) return;
            const senderId = newMsg.sender?._id || newMsg.sender;
            const receiverId = newMsg.receiver?._id || newMsg.receiver;
            const activeId = selectedUser?._id;

            if (
                (senderId === activeId && receiverId === userData?._id) ||
                (senderId === userData?._id && receiverId === activeId)
            ) {
                setMessages(prev => {
                    if (prev.some(m => m._id === newMsg._id)) return prev;
                    const optIndex = prev.findIndex(m => m.isOptimistic && m.message === newMsg.message);
                    if (optIndex !== -1) {
                        const updated = [...prev];
                        updated[optIndex] = newMsg;
                        return updated;
                    }
                    return [...prev, newMsg];
                });

                if (senderId === activeId) {
                    try {
                        await axios.post(`${serverUrl}/api/message/seen/${activeId}`, {}, { withCredentials: true });
                        fetchBadgeCounts();
                    } catch (e) {
                        console.log("Seen update error:", e);
                    }
                }
            }
        };

        const handleConnectionRemoved = ({ userId }) => {
            setConnections(prev => prev.filter(c => c._id !== userId));
        };

        const handleStatusUpdate = ({ updatedUserId, newStatus }) => {
            if (newStatus === "connect" || newStatus === "pending") {
                setConnections(prev => prev.filter(c => c._id !== updatedUserId));
            } else if (newStatus === "disconnect") {
                fetchConnections();
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("connectionRemoved", handleConnectionRemoved);
        socket.on("statusUpdate", handleStatusUpdate);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("connectionRemoved", handleConnectionRemoved);
            socket.off("statusUpdate", handleStatusUpdate);
        };
    }, [selectedUser, userData, serverUrl, fetchBadgeCounts]);

    const filteredConnections = connections.filter(con => {
        const fullName = `${con.firstName} ${con.lastName}`.toLowerCase();
        const username = (con.userName || "").toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || username.includes(searchTerm.toLowerCase());
    });

    const connectedWithActiveUser = selectedUser ? isUserConnected(selectedUser._id) : false;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 pt-18 sm:pt-20 pb-8 px-2 sm:px-6 transition-colors flex flex-col">
            <Nav />

            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
                
                <div className="bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] shadow-xs flex-1 flex overflow-hidden min-h-[580px] max-h-[82vh]">
                    
                    <aside className={`w-full md:w-80 border-r border-slate-200 dark:border-[#2d1c15] flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                        
                        <div className="p-3 border-b border-slate-200 dark:border-[#2d1c15] space-y-2.5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                    <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-[#FB6C00] dark:text-[#F9B637]" />
                                    <span>Messages</span>
                                </h2>
                                {!loadingConnections && (
                                    <span className="text-[11px] font-semibold text-[#E73F1E] dark:text-[#F9B637] bg-[#FB6C00]/10 px-2 py-0.5 rounded-md">
                                        {connections.length} Connected
                                    </span>
                                )}
                            </div>

                            <div className="relative flex items-center">
                                <HiOutlineMagnifyingGlass className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                                <input 
                                    type="text"
                                    placeholder="Search connections..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs rounded-md border border-slate-200 dark:border-[#2d1c15] focus:border-[#FB6C00] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2d1c15]/60">
                            {loadingConnections ? (
                                <div className="space-y-1 p-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="p-2.5 flex items-center gap-3 animate-pulse">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2d1c15] shrink-0"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3.5 bg-slate-200 dark:bg-[#2d1c15] rounded w-3/4"></div>
                                                <div className="h-2.5 bg-slate-200 dark:bg-[#2d1c15] rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredConnections.length > 0 ? (
                                filteredConnections.map((con) => {
                                    const isSelected = selectedUser?._id === con._id;
                                    return (
                                        <div
                                            key={con._id}
                                            onClick={() => setSelectedUser(con)}
                                            className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                                                isSelected 
                                                    ? 'bg-[#FB6C00]/10 dark:bg-[#2d1c15] border-l-3 border-[#FB6C00]' 
                                                    : 'hover:bg-slate-50 dark:hover:bg-[#2d1c15]/40'
                                            }`}
                                        >
                                            <div className="relative shrink-0">
                                                <img 
                                                    src={con.profileImage || dp} 
                                                    alt={con.firstName} 
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15]"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-[#E73F1E] dark:text-[#F9B637]' : 'text-slate-900 dark:text-zinc-100'}`}>
                                                    {con.firstName} {con.lastName}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                    {con.headline || `@${con.userName}`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-6 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
                                    <p>No connected users found.</p>
                                    <button 
                                        onClick={() => navigate("/network")}
                                        className="text-xs text-[#FB6C00] dark:text-[#F9B637] hover:underline font-semibold"
                                    >
                                        Connect with people
                                    </button>
                                </div>
                            )}
                        </div>

                    </aside>

                    <main className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-[#110d0a] ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                        
                        {selectedUser ? (
                            <>
                                <div className="p-3 bg-white dark:bg-[#17120e] border-b border-slate-200 dark:border-[#2d1c15] flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <button 
                                            onClick={() => setSelectedUser(null)}
                                            className="md:hidden p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#2d1c15] text-slate-600 dark:text-zinc-300"
                                        >
                                            <HiOutlineArrowLeft className="w-4 h-4" />
                                        </button>

                                        <img 
                                            src={selectedUser.profileImage || dp} 
                                            alt={selectedUser.firstName} 
                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <h3 
                                                onClick={() => handleGetProfile(selectedUser.userName)}
                                                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate hover:text-[#FB6C00] dark:hover:text-[#F9B637] cursor-pointer transition-colors"
                                            >
                                                {selectedUser.firstName} {selectedUser.lastName}
                                            </h3>
                                            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                {selectedUser.headline || `@${selectedUser.userName}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <ConnectButton userId={selectedUser._id} />
                                        <button 
                                            onClick={() => handleGetProfile(selectedUser.userName)}
                                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-200 dark:border-[#2d1c15] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#2d1c15] hover:text-[#FB6C00] dark:hover:text-[#F9B637] transition-colors flex items-center gap-1"
                                            title="View Profile"
                                        >
                                            <HiOutlineUser className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Profile</span>
                                        </button>
                                    </div>
                                </div>

                                {!connectedWithActiveUser && (
                                    <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                        <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                                        <span>You are not connected with this user. Connect with them to send messages.</span>
                                    </div>
                                )}

                                {sendError && (
                                    <div className="bg-rose-500/10 border-b border-rose-500/20 px-3.5 py-2 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                                        <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                                        <span>{sendError}</span>
                                    </div>
                                )}

                                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
                                    {loadingMessages ? (
                                        <div className="space-y-3 animate-pulse">
                                            <div className="flex flex-col items-start space-y-1">
                                                <div className="h-9 bg-slate-200 dark:bg-[#2d1c15] rounded-lg rounded-bl-none w-48"></div>
                                                <div className="h-2 bg-slate-200 dark:bg-[#2d1c15] rounded w-12 ml-1"></div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <div className="h-12 bg-slate-200 dark:bg-[#2d1c15] rounded-lg rounded-br-none w-64"></div>
                                                <div className="h-2 bg-slate-200 dark:bg-[#2d1c15] rounded w-12 mr-1"></div>
                                            </div>
                                            <div className="flex flex-col items-start space-y-1">
                                                <div className="h-10 bg-slate-200 dark:bg-[#2d1c15] rounded-lg rounded-bl-none w-56"></div>
                                                <div className="h-2 bg-slate-200 dark:bg-[#2d1c15] rounded w-12 ml-1"></div>
                                            </div>
                                        </div>
                                    ) : messages.length > 0 ? (
                                        messages.map((msg) => {
                                            const isMine = (msg.sender?._id || msg.sender) === userData?._id;
                                            return (
                                                <div 
                                                    key={msg._id}
                                                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div 
                                                        className={`max-w-[82%] sm:max-w-md px-3.5 py-2 rounded-lg text-xs sm:text-sm leading-relaxed shadow-2xs break-words ${
                                                            isMine 
                                                                ? 'bg-gradient-to-r from-[#E73F1E] to-[#FB6C00] text-white rounded-br-none' 
                                                                : 'bg-white dark:bg-[#1f1712] text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-[#2d1c15] rounded-bl-none'
                                                        }`}
                                                    >
                                                        {msg.message}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 px-1">
                                                        {moment(msg.createdAt).format("hh:mm A")}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-[#FB6C00]/10 dark:bg-[#FB6C00]/20 flex items-center justify-center text-[#E73F1E] dark:text-[#F9B637]">
                                                <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                                                No messages yet
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-xs">
                                                {connectedWithActiveUser
                                                    ? `Say hello to ${selectedUser.firstName} to start the conversation!`
                                                    : `Connect with ${selectedUser.firstName} to start messaging.`}
                                            </p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form 
                                    onSubmit={handleSendMessage}
                                    className="p-2.5 sm:p-3 bg-white dark:bg-[#17120e] border-t border-slate-200 dark:border-[#2d1c15] flex items-center gap-2"
                                >
                                    <input 
                                        type="text"
                                        disabled={!connectedWithActiveUser}
                                        placeholder={
                                            connectedWithActiveUser 
                                                ? `Message ${selectedUser.firstName}...` 
                                                : `You must be connected to message ${selectedUser.firstName}`
                                        }
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        className="flex-1 px-3.5 py-2 rounded-md bg-slate-100 dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm border border-slate-200 dark:border-[#2d1c15] focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />

                                    <button 
                                        type="submit"
                                        disabled={!inputMessage.trim() || sending || !connectedWithActiveUser}
                                        className="p-2.5 rounded-md bg-[#FB6C00] hover:bg-[#E73F1E] text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Send message"
                                    >
                                        <HiPaperAirplane className="w-4 h-4" />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                                <div className="w-12 h-12 rounded-lg bg-[#FB6C00]/10 dark:bg-[#FB6C00]/20 flex items-center justify-center text-[#E73F1E] dark:text-[#F9B637]">
                                    <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                                    Your Direct Messages
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                                    Select a connection from the left sidebar to send and receive real-time messages.
                                </p>
                            </div>
                        )}

                    </main>

                </div>

            </div>
        </div>
    );
}

export default Chat;
