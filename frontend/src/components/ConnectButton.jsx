import React, { useContext, useEffect, useState } from 'react';
import { authDataContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import { userDataContext } from '../context/userContext.jsx';
import { socket } from '../../socket.js';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiUserCheck, FiClock, FiUserX } from 'react-icons/fi';

function ConnectButton({ userId }) {
    const navigate = useNavigate();
    const { serverUrl } = useContext(authDataContext);
    const { userData } = useContext(userDataContext); 
    const [status, setStatus] = useState("Connect");
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleGetStatus = async () => {
        if (!userId) return;
        try {
            let result = await axios.get(`${serverUrl}/api/connection/getstatus/${userId}`, { withCredentials: true });
            setStatus(result.data.status || "Connect");
        } catch (error) {
            console.log("Get connection status error:", error);
        }
    };

    const handleSendConnection = async () => {
        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/connection/send/${userId}`, {}, { withCredentials: true });
            setStatus("pending");
        } catch (error) {
            console.log("Send connection error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveConnection = async () => {
        setLoading(true);
        try {
            await axios.delete(`${serverUrl}/api/connection/remove/${userId}`, { withCredentials: true });
            setStatus("Connect");
        } catch (error) {
            console.log("Remove connection error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData?._id) {
            socket.emit("register", userData._id);
        }
        handleGetStatus();

        const handleStatusUpdate = ({ updatedUserId, newStatus }) => {
            if (updatedUserId === userId) {
                setStatus(newStatus);
            }
        };

        socket.on("statusUpdate", handleStatusUpdate);

        return () => {
            socket.off("statusUpdate", handleStatusUpdate);
        };
    }, [userId, userData]);
    
    const handleClick = async () => {
        if (loading) return;
        const normalizedStatus = status.toLowerCase();

        if (normalizedStatus === "disconnect") {
            await handleRemoveConnection();
        } else if (normalizedStatus === "received") {
            navigate("/network");
        } else {
            await handleSendConnection();
        }
    };

    const normalized = status.toLowerCase();

    if (normalized === "disconnect") {
        return (
            <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
                disabled={loading}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isHovered
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                        : "bg-slate-100 dark:bg-[#2d1c15] text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-[#FB6C00]/40 hover:bg-slate-200 dark:hover:bg-[#E73F1E]/30"
                }`}
            >
                {isHovered ? <FiUserX className="w-3.5 h-3.5" /> : <FiUserCheck className="w-3.5 h-3.5 text-[#E73F1E] dark:text-[#F9B637]" />}
                <span>{isHovered ? "Disconnect" : "Connected"}</span>
            </button>
        );
    }

    if (normalized === "pending") {
        return (
            <button 
                disabled
                className="px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center gap-1.5 cursor-not-allowed opacity-90"
            >
                <FiClock className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" style={{ animationDuration: '4s' }} />
                <span>Pending</span>
            </button>
        );
    }

    if (normalized === "received") {
        return (
            <button 
                onClick={handleClick}
                className="px-3 py-1 rounded-md text-xs font-semibold bg-[#E73F1E] hover:bg-[#FB6C00] text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
                <FiUserCheck className="w-3.5 h-3.5" />
                <span>Accept</span>
            </button>
        );
    }

    return (
        <button 
            onClick={handleClick}
            disabled={loading}
            className="px-3 py-1 rounded-md text-xs font-semibold bg-[#FB6C00] hover:bg-[#E73F1E] text-white flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
        >
            <FiUserPlus className="w-3.5 h-3.5" />
            <span>Connect</span>
        </button>
    );
}

export default ConnectButton;
