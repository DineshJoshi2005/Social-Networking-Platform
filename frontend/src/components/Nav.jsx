import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { IoSearchOutline, IoNotificationsOutline, IoCloseOutline } from "react-icons/io5";
import { HiOutlineHome, HiOutlineUserGroup, HiLink, HiOutlineSun, HiOutlineMoon, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";
import dp from '../assets/dp.webp';
import { userDataContext } from '../context/UserContext.jsx';
import { authDataContext } from '../context/AuthContext.jsx';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

function Nav() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchData, setSearchData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const { 
        userData, 
        setUserData, 
        handleGetProfile,
        unreadNotifications,
        unreadMessages,
        pendingConnections
    } = useContext(userDataContext);
    
    const { serverUrl } = useContext(authDataContext);
    const { darkMode, toggleTheme } = useContext(ThemeContext);

    const navigate = useNavigate();
    const location = useLocation();

    const searchRef = useRef(null);
    const menuRef = useRef(null);

    const handleSignOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
            setUserData(null);
            navigate("/login");
        } catch (err) {
            console.log("Sign out error:", err);
        }
    };

    const handleSearch = async () => {
        if (!searchInput.trim()) {
            setSearchData([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            let result = await axios.get(`${serverUrl}/api/user/search?query=${searchInput}`, {
                withCredentials: true
            });
            setSearchData(result.data || []);
        } catch (error) {
            console.log("Search error:", error);
            setSearchData([]);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchData([]);
            }
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <header className="fixed top-0 left-0 w-full h-14 bg-white/95 dark:bg-[#110d0a]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#2d1c15] z-50 transition-colors">
            <div className="max-w-6xl mx-auto h-full px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-4">
                
                <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0 max-w-xs sm:max-w-md" ref={searchRef}>
                    <div 
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 cursor-pointer group select-none shrink-0"
                    >
                        <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-md bg-gradient-to-tr from-[#E73F1E] to-[#FB6C00] hover:opacity-95 flex items-center justify-center text-white shadow-xs transition-all">
                            <HiLink className="w-4 h-4" />
                        </div>
                        <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#E73F1E] to-[#FB6C00] bg-clip-text text-transparent tracking-tight hidden lg:inline-block">
                            Conexis
                        </span>
                    </div>

                    <div className="relative flex-1 min-w-0">
                        <div className="relative flex items-center">
                            <IoSearchOutline className="absolute left-2 sm:left-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                            <input 
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search..."
                                className="w-full bg-slate-100 dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm pl-7 sm:pl-9 pr-6 sm:pr-8 py-1.5 rounded-md border border-slate-200 dark:border-[#2d1c15] focus:border-[#FB6C00] focus:bg-white dark:focus:bg-[#17120e] focus:outline-none focus:ring-1 focus:ring-[#FB6C00]/20 transition-all truncate"
                            />
                            {searchInput && (
                                <button 
                                    onClick={() => { setSearchInput(""); setSearchData([]); }}
                                    className="absolute right-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5"
                                >
                                    <IoCloseOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            )}
                        </div>

                        {searchInput && (
                            <div className="fixed top-15 left-2.5 right-2.5 sm:absolute sm:top-10 sm:left-0 sm:right-auto sm:w-96 bg-white dark:bg-[#17120e] rounded-xl shadow-2xl border border-slate-200 dark:border-[#2d1c15] p-3 z-50 max-h-[75vh] sm:max-h-80 overflow-y-auto">
                                <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-100 dark:border-[#2d1c15]">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                                        {isSearching ? "Searching..." : `Results (${searchData.length})`}
                                    </p>
                                    <button 
                                        onClick={() => { setSearchInput(""); setSearchData([]); }}
                                        className="sm:hidden text-xs text-[#FB6C00] font-semibold"
                                    >
                                        Close
                                    </button>
                                </div>

                                {searchData.length > 0 ? (
                                    <div className="space-y-1">
                                        {searchData.map((user) => (
                                            <div 
                                                key={user._id}
                                                onClick={() => {
                                                    handleGetProfile(user.userName);
                                                    setSearchData([]);
                                                    setSearchInput("");
                                                }}
                                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#2d1c15]/60 active:bg-[#FB6C00]/10 cursor-pointer transition-colors"
                                            >
                                                <img 
                                                    src={user.profileImage || dp} 
                                                    alt={user.firstName}
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate">
                                                        {user.headline || `@${user.userName}`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : !isSearching && searchInput.trim() ? (
                                    <div className="p-6 text-center text-slate-400 dark:text-zinc-500 text-xs">
                                        No users found matching "<span className="font-semibold text-slate-600 dark:text-zinc-300">{searchInput}</span>"
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
                    <button 
                        onClick={() => navigate("/")}
                        className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                            location.pathname === "/" 
                                ? "bg-[#FB6C00]/10 text-[#E73F1E] dark:text-[#F9B637] font-bold" 
                                : "text-slate-600 dark:text-zinc-300 hover:text-[#E73F1E] dark:hover:text-[#F9B637] hover:bg-slate-100 dark:hover:bg-[#2d1c15]/60"
                        }`}
                        title="Feed"
                    >
                        <HiOutlineHome className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        <span className="hidden md:inline">Feed</span>
                    </button>

                    <button 
                        onClick={() => navigate("/network")}
                        className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                            location.pathname === "/network" 
                                ? "bg-[#FB6C00]/10 text-[#E73F1E] dark:text-[#F9B637] font-bold" 
                                : "text-slate-600 dark:text-zinc-300 hover:text-[#E73F1E] dark:hover:text-[#F9B637] hover:bg-slate-100 dark:hover:bg-[#2d1c15]/60"
                        }`}
                        title="Network"
                    >
                        <div className="relative flex items-center justify-center">
                            <HiOutlineUserGroup className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            {pendingConnections > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#FB6C00] text-white text-[9px] font-bold px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full shadow-xs">
                                    {pendingConnections > 99 ? '99+' : pendingConnections}
                                </span>
                            )}
                        </div>
                        <span className="hidden md:inline">Network</span>
                    </button>

                    <button 
                        onClick={() => navigate("/chat")}
                        className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                            isActive("/chat") 
                                ? "bg-[#FB6C00]/10 text-[#E73F1E] dark:text-[#F9B637] font-bold" 
                                : "text-slate-600 dark:text-zinc-300 hover:text-[#E73F1E] dark:hover:text-[#F9B637] hover:bg-slate-100 dark:hover:bg-[#2d1c15]/60"
                        }`}
                        title="Messaging"
                    >
                        <div className="relative flex items-center justify-center">
                            <HiOutlineChatBubbleLeftRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            {unreadMessages > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#FB6C00] text-white text-[9px] font-bold px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full shadow-xs">
                                    {unreadMessages > 99 ? '99+' : unreadMessages}
                                </span>
                            )}
                        </div>
                        <span className="hidden md:inline">Messaging</span>
                    </button>

                    <button 
                        onClick={() => navigate("/notification")}
                        className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                            location.pathname === "/notification" 
                                ? "bg-[#FB6C00]/10 text-[#E73F1E] dark:text-[#F9B637] font-bold" 
                                : "text-slate-600 dark:text-zinc-300 hover:text-[#E73F1E] dark:hover:text-[#F9B637] hover:bg-slate-100 dark:hover:bg-[#2d1c15]/60"
                        }`}
                        title="Alerts"
                    >
                        <div className="relative flex items-center justify-center">
                            <IoNotificationsOutline className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#E73F1E] text-white text-[9px] font-bold px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full shadow-xs animate-pulse">
                                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                </span>
                            )}
                        </div>
                        <span className="hidden md:inline">Alerts</span>
                    </button>

                    <button 
                        onClick={toggleTheme}
                        className="p-1.5 rounded-md text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#2d1c15] hover:text-[#FB6C00] dark:hover:text-[#F9B637] transition-colors shrink-0"
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? <HiOutlineSun className="w-4 h-4 text-[#F9B637]" /> : <HiOutlineMoon className="w-4 h-4" />}
                    </button>

                    {userData && (
                        <div className="relative shrink-0" ref={menuRef}>
                            <button 
                                onClick={() => setShowUserMenu(prev => !prev)}
                                className="flex items-center gap-1 p-0.5 sm:p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#2d1c15] transition-colors focus:outline-none"
                            >
                                <img 
                                    src={userData.profileImage || dp} 
                                    alt={userData.firstName} 
                                    className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15]"
                                />
                                <FiChevronDown className={`w-3 h-3 text-slate-500 dark:text-zinc-400 hidden sm:block transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 top-10 w-56 bg-white dark:bg-[#17120e] rounded-lg shadow-lg border border-slate-200 dark:border-[#2d1c15] p-2 z-50">
                                    <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-[#110d0a] rounded-md mb-2">
                                        <img 
                                            src={userData.profileImage || dp} 
                                            alt={userData.firstName} 
                                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15]"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">
                                                {userData.firstName} {userData.lastName}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                {userData.headline || `@${userData.userName}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-0.5">
                                        <button 
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                handleGetProfile(userData.userName);
                                            }}
                                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-[#FB6C00]/10 hover:text-[#E73F1E] dark:hover:text-[#F9B637] rounded-md transition-colors font-medium"
                                        >
                                            <FiUser className="w-3.5 h-3.5" />
                                            View Profile
                                        </button>

                                        <button 
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate("/network");
                                            }}
                                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-[#FB6C00]/10 hover:text-[#E73F1E] dark:hover:text-[#F9B637] rounded-md transition-colors font-medium"
                                        >
                                            <HiOutlineUserGroup className="w-3.5 h-3.5" />
                                            My Network
                                        </button>

                                        <button 
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate("/chat");
                                            }}
                                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-[#FB6C00]/10 hover:text-[#E73F1E] dark:hover:text-[#F9B637] rounded-md transition-colors font-medium"
                                        >
                                            <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
                                            Messages
                                        </button>

                                        <div className="border-t border-slate-100 dark:border-[#2d1c15] my-1"></div>

                                        <button 
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors font-medium"
                                        >
                                            <FiLogOut className="w-3.5 h-3.5" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}

export default Nav;
