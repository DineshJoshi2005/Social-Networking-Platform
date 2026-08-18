import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authDataContext } from '../context/AuthContext.jsx';
import { userDataContext } from '../context/UserContext.jsx';
import axios from "axios";
import { 
    HiOutlineEnvelope, 
    HiOutlineLockClosed, 
    HiOutlineUser, 
    HiOutlineAtSymbol,
    HiOutlineEye, 
    HiOutlineEyeSlash, 
    HiLink 
} from "react-icons/hi2";

function Signup() {
    const navigate = useNavigate();
    const { serverUrl } = useContext(authDataContext);
    const { setUserData } = useContext(userDataContext);

    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                firstName,
                lastName,
                userName,
                email,
                password
            }, { withCredentials: true });

            setUserData(result.data);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Error creating account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0f0b09] flex items-center justify-center p-4 transition-colors">
            
            <div className="w-full max-w-lg bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] shadow-md p-8 relative z-10 space-y-5">
                
                <div className="text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-[#E73F1E] to-[#FB6C00] flex items-center justify-center text-white mx-auto shadow-xs">
                        <HiLink className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                        Create your Conexis account
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Connect, collaborate, and grow with your network
                    </p>
                </div>

                {error && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-md text-xs font-semibold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">First Name</label>
                            <div className="relative flex items-center">
                                <HiOutlineUser className="absolute left-3 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                                <input 
                                    type="text" 
                                    required 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First name" 
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0f0b09] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm rounded-md border border-slate-200 dark:border-[#2d1c15] focus:bg-white dark:focus:bg-[#1f1712] focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Last Name</label>
                            <div className="relative flex items-center">
                                <HiOutlineUser className="absolute left-3 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                                <input 
                                    type="text" 
                                    required 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last name" 
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0f0b09] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm rounded-md border border-slate-200 dark:border-[#2d1c15] focus:bg-white dark:focus:bg-[#1f1712] focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Username</label>
                        <div className="relative flex items-center">
                            <HiOutlineAtSymbol className="absolute left-3 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                            <input 
                                type="text" 
                                required 
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Choose a username" 
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0f0b09] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm rounded-md border border-slate-200 dark:border-[#2d1c15] focus:bg-white dark:focus:bg-[#1f1712] focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Email Address</label>
                        <div className="relative flex items-center">
                            <HiOutlineEnvelope className="absolute left-3 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@email.com" 
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0f0b09] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm rounded-md border border-slate-200 dark:border-[#2d1c15] focus:bg-white dark:focus:bg-[#1f1712] focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Password (at least 8 characters)</label>
                        <div className="relative flex items-center">
                            <HiOutlineLockClosed className="absolute left-3 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-[#0f0b09] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm rounded-md border border-slate-200 dark:border-[#2d1c15] focus:bg-white dark:focus:bg-[#1f1712] focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15 transition-all"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 focus:outline-none"
                            >
                                {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-md text-xs sm:text-sm font-bold bg-[#FB6C00] hover:bg-[#E73F1E] text-white shadow-xs disabled:opacity-50 transition-colors mt-2"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-100 dark:border-[#2d1c15]">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Already have an account?{" "}
                        <button 
                            type="button"
                            onClick={() => navigate("/login")}
                            className="font-bold text-[#E73F1E] dark:text-[#F9B637] hover:underline focus:outline-none"
                        >
                            Sign in
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Signup;
