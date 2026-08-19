import React, { useContext, useState, createContext, useEffect, useCallback } from 'react';
import { authDataContext } from './AuthContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../socket.js';

export const userDataContext = createContext();

function UserContext({ children }) {
    const [userData, setUserData] = useState(null);
    const { serverUrl } = useContext(authDataContext);
    const [edit, setEdit] = useState(false);
    const [postData, setPostData] = useState([]);
    const [profileData, setProfileData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingConnections, setPendingConnections] = useState(0);

    const navigate = useNavigate();

    const fetchBadgeCounts = useCallback(async () => {
        try {
            const notifRes = await axios.get(`${serverUrl}/api/notification/unread-count`, { withCredentials: true });
            setUnreadNotifications(notifRes.data?.count || 0);
        } catch {
            try {
                const fallbackRes = await axios.get(`${serverUrl}/api/notification/get`, { withCredentials: true });
                const unread = (fallbackRes.data || []).filter(n => !n.isRead);
                setUnreadNotifications(unread.length);
            } catch (err) {
                console.log("Badge notif error:", err);
            }
        }

        try {
            const msgRes = await axios.get(`${serverUrl}/api/message/unread-count`, { withCredentials: true });
            setUnreadMessages(msgRes.data?.count || 0);
        } catch (e) {
            console.log("Badge msg error:", e);
        }

        try {
            const connRes = await axios.get(`${serverUrl}/api/connection/requests`, { withCredentials: true });
            setPendingConnections((connRes.data || []).length);
        } catch (e) {
            console.log("Badge connection error:", e);
        }
    }, [serverUrl]);

    const getCurrentUser = async () => {
        try {
            let result = await axios.get(`${serverUrl}/api/user/currentuser`, { withCredentials: true });
            setUserData(result.data);
            if (result.data?._id) {
                socket.emit("register", result.data._id);
                fetchBadgeCounts();
            }
        } catch (err) {
            console.log("Current user fetch error:", err);
            setUserData(null);
        } finally {
            setLoadingUser(false);
        }
    };

    const getPost = async () => {
        setLoadingPosts(true);
        try {
            let result = await axios.get(`${serverUrl}/api/post/getpost`, { withCredentials: true });
            setPostData(result.data || []);
        } catch (error) {
            console.log("Get posts error:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleGetProfile = async (userName) => {
        try {
            let result = await axios.get(`${serverUrl}/api/user/profile/${userName}`, {
                withCredentials: true
            });
            setProfileData(result.data);
            navigate("/profile");
        } catch (error) {
            console.log("Get profile error:", error);
        }
    };

    useEffect(() => {
        getCurrentUser();
        getPost();
    }, []);

    useEffect(() => {
        if (!userData?._id) return;

        socket.emit("register", userData._id);

        const handleNewPost = (newPost) => {
            setPostData((prevPosts) => {
                if (prevPosts.some((p) => p._id === newPost._id)) {
                    return prevPosts;
                }
                return [newPost, ...prevPosts];
            });
        };

        const handleNewNotification = () => {
            setUnreadNotifications((prev) => prev + 1);
        };

        const handleNewMessage = (msg) => {
            const receiverId = msg.receiver?._id || msg.receiver;
            if (receiverId === userData._id) {
                if (!window.location.pathname.startsWith("/chat")) {
                    setUnreadMessages((prev) => prev + 1);
                }
            }
        };

        const handleNewConnectionRequest = () => {
            fetchBadgeCounts();
        };

        const handleStatusUpdate = () => {
            fetchBadgeCounts();
        };

        socket.on("newPostCreated", handleNewPost);
        socket.on("newNotification", handleNewNotification);
        socket.on("newMessage", handleNewMessage);
        socket.on("newConnectionRequest", handleNewConnectionRequest);
        socket.on("statusUpdate", handleStatusUpdate);

        return () => {
            socket.off("newPostCreated", handleNewPost);
            socket.off("newNotification", handleNewNotification);
            socket.off("newMessage", handleNewMessage);
            socket.off("newConnectionRequest", handleNewConnectionRequest);
            socket.off("statusUpdate", handleStatusUpdate);
        };
    }, [userData?._id, fetchBadgeCounts]);

    const value = {
        userData,
        setUserData,
        edit,
        setEdit,
        postData,
        setPostData,
        getPost,
        handleGetProfile,
        profileData,
        setProfileData,
        getCurrentUser,
        loadingUser,
        loadingPosts,
        unreadNotifications,
        setUnreadNotifications,
        unreadMessages,
        setUnreadMessages,
        pendingConnections,
        setPendingConnections,
        fetchBadgeCounts
    };

    return (
        <userDataContext.Provider value={value}>
            {children}
        </userDataContext.Provider>
    );
}

export default UserContext;
