import React, { useContext, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext.jsx';
import dp from "../assets/dp.webp";
import { authDataContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import { 
    HiXMark, 
    HiOutlineCamera, 
    HiOutlineTrash,
    HiOutlineUser,
    HiOutlineAcademicCap,
    HiOutlineBriefcase,
    HiOutlineSparkles
} from "react-icons/hi2";

function EditProfile() {
    const { setEdit, userData, setUserData } = useContext(userDataContext);
    const { serverUrl } = useContext(authDataContext);

    const [activeSection, setActiveSection] = useState("general");
    const [saving, setSaving] = useState(false);

    const [firstName, setFirstName] = useState(userData?.firstName || "");
    const [lastName, setLastName] = useState(userData?.lastName || "");
    const [userName, setUserName] = useState(userData?.userName || "");
    const [headline, setHeadline] = useState(userData?.headline || "");
    const [location, setLocation] = useState(userData?.location || "");
    const [gender, setGender] = useState(userData?.gender || "");

    const [skills, setSkills] = useState(userData?.skills || []);
    const [newSkill, setNewSkill] = useState("");

    const [education, setEducation] = useState(userData?.education || []);
    const [newEducation, setNewEducation] = useState({
        college: "",
        degree: "",
        fieldOfStudy: ""
    });

    const [experience, setExperience] = useState(userData?.experience || []);
    const [newExperience, setNewExperience] = useState({
        title: "",
        company: "",
        description: ""
    });

    const [frontendProfileImage, setFrontendProfileImage] = useState(userData?.profileImage || dp);
    const [backendProfileImage, setBackendProfileImage] = useState(null);
    const [frontendCoverImage, setFrontendCoverImage] = useState(userData?.coverImage || null);
    const [backendCoverImage, setBackendCoverImage] = useState(null);

    const profileImageRef = useRef();
    const coverImageRef = useRef();

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const addEducation = () => {
        if (newEducation.college && newEducation.degree && newEducation.fieldOfStudy) {
            setEducation([...education, newEducation]);
            setNewEducation({ college: "", degree: "", fieldOfStudy: "" });
        }
    };

    const removeEducation = (indexToRemove) => {
        setEducation(education.filter((_, idx) => idx !== indexToRemove));
    };

    const addExperience = () => {
        if (newExperience.title && newExperience.company) {
            setExperience([...experience, newExperience]);
            setNewExperience({ title: "", company: "", description: "" });
        }
    };

    const removeExperience = (indexToRemove) => {
        setExperience(experience.filter((_, idx) => idx !== indexToRemove));
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackendProfileImage(file);
            setFrontendProfileImage(URL.createObjectURL(file));
        }
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackendCoverImage(file);
            setFrontendCoverImage(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);
            formData.append("userName", userName);
            formData.append("headline", headline);
            formData.append("location", location);
            formData.append("gender", gender);
            formData.append("skills", JSON.stringify(skills));
            formData.append("education", JSON.stringify(education));
            formData.append("experience", JSON.stringify(experience));

            if (backendProfileImage) {
                formData.append("profileImage", backendProfileImage);
            }
            if (backendCoverImage) {
                formData.append("coverImage", backendCoverImage);
            }

            const result = await axios.put(`${serverUrl}/api/user/updateprofile`, formData, {
                withCredentials: true
            });

            setUserData(result.data);
            setEdit(false);
        } catch (err) {
            console.log("Update profile error:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                onClick={() => setEdit(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            ></div>

            <div className="relative w-full max-w-xl bg-white dark:bg-[#17120e] rounded-lg shadow-2xl border border-slate-200 dark:border-[#2d1c15] z-10 overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="px-5 py-3 border-b border-slate-200 dark:border-[#2d1c15] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Edit Profile</h3>
                    <button 
                        onClick={() => setEdit(false)}
                        className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-[#2d1c15] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 flex items-center justify-center transition-colors"
                    >
                        <HiXMark className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-5 pt-2 flex items-center gap-1.5 border-b border-slate-200 dark:border-[#2d1c15] overflow-x-auto">
                    <button 
                        onClick={() => setActiveSection("general")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${
                            activeSection === "general" ? "bg-[#FB6C00]/10 dark:bg-[#FB6C00]/25 text-[#E73F1E] dark:text-[#F9B637]" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#2d1c15]"
                        }`}
                    >
                        <HiOutlineUser className="w-3.5 h-3.5" />
                        <span>Basic Info</span>
                    </button>

                    <button 
                        onClick={() => setActiveSection("skills")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${
                            activeSection === "skills" ? "bg-[#FB6C00]/10 dark:bg-[#FB6C00]/25 text-[#E73F1E] dark:text-[#F9B637]" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#2d1c15]"
                        }`}
                    >
                        <HiOutlineSparkles className="w-3.5 h-3.5" />
                        <span>Skills</span>
                    </button>

                    <button 
                        onClick={() => setActiveSection("experience")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${
                            activeSection === "experience" ? "bg-[#FB6C00]/10 dark:bg-[#FB6C00]/25 text-[#E73F1E] dark:text-[#F9B637]" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#2d1c15]"
                        }`}
                    >
                        <HiOutlineBriefcase className="w-3.5 h-3.5" />
                        <span>Experience</span>
                    </button>

                    <button 
                        onClick={() => setActiveSection("education")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${
                            activeSection === "education" ? "bg-[#FB6C00]/10 dark:bg-[#FB6C00]/25 text-[#E73F1E] dark:text-[#F9B637]" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#2d1c15]"
                        }`}
                    >
                        <HiOutlineAcademicCap className="w-3.5 h-3.5" />
                        <span>Education</span>
                    </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                    
                    {activeSection === "general" && (
                        <div className="space-y-4">
                            
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Profile & Cover Photos</label>
                                
                                <div className="relative rounded-md overflow-hidden border border-slate-200 dark:border-[#2d1c15] bg-slate-100 dark:bg-[#0f0b09]">
                                    <div 
                                        onClick={() => coverImageRef.current?.click()}
                                        className="h-28 w-full bg-gradient-to-r from-[#E73F1E] via-[#FB6C00] to-[#F9B637] cursor-pointer relative group flex items-center justify-center"
                                    >
                                        {frontendCoverImage && (
                                            <img src={frontendCoverImage} alt="Cover" className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-semibold transition-opacity">
                                            <HiOutlineCamera className="w-4 h-4" />
                                            <span>Change Cover</span>
                                        </div>
                                    </div>

                                    <div className="p-3 pt-0 relative flex items-center justify-between">
                                        <div 
                                            onClick={() => profileImageRef.current?.click()}
                                            className="w-16 h-16 rounded-full border-2 border-white dark:border-[#17120e] shadow-xs overflow-hidden -mt-8 bg-white dark:bg-[#17120e] relative group cursor-pointer"
                                        >
                                            <img src={frontendProfileImage} alt="Avatar" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                <HiOutlineCamera className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-slate-400 dark:text-zinc-500">Click avatar or banner to upload</span>
                                    </div>
                                </div>

                                <input type="file" accept="image/*" hidden ref={profileImageRef} onChange={handleProfileImageChange} />
                                <input type="file" accept="image/*" hidden ref={coverImageRef} onChange={handleCoverImageChange} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">First Name</label>
                                    <input 
                                        type="text" 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)} 
                                        className="w-full px-3 py-1.5 rounded-md text-xs sm:text-sm border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)} 
                                        className="w-full px-3 py-1.5 rounded-md text-xs sm:text-sm border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Username</label>
                                    <input 
                                        type="text" 
                                        value={userName} 
                                        onChange={(e) => setUserName(e.target.value)} 
                                        className="w-full px-3 py-1.5 rounded-md text-xs sm:text-sm border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Location</label>
                                    <input 
                                        type="text" 
                                        placeholder="City, Country"
                                        value={location} 
                                        onChange={(e) => setLocation(e.target.value)} 
                                        className="w-full px-3 py-1.5 rounded-md text-xs sm:text-sm border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Gender</label>
                                    <input 
                                        type="text" 
                                        placeholder="Male / Female / Other"
                                        value={gender} 
                                        onChange={(e) => setGender(e.target.value)} 
                                        className="w-full px-3 py-1.5 rounded-md text-xs sm:text-sm border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Headline</label>
                                    <textarea 
                                        rows={2}
                                        value={headline} 
                                        onChange={(e) => setHeadline(e.target.value)} 
                                        placeholder="e.g. Software Engineer | Designer"
                                        className="w-full px-3 py-1.5 rounded-md text-xs sm:text-sm border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "skills" && (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Add a new skill"
                                    value={newSkill} 
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                    className="flex-1 px-3 py-1.5 rounded-md text-xs sm:text-sm border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#0f0b09] text-slate-800 dark:text-zinc-100 focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15"
                                />
                                <button 
                                    type="button"
                                    onClick={addSkill}
                                    className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#FB6C00] hover:bg-[#E73F1E] text-white transition-colors"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {skills.map((skill, index) => (
                                    <span 
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-[#1f1712] text-slate-700 dark:text-zinc-300 rounded-md text-xs font-semibold border border-slate-200 dark:border-[#2d1c15]"
                                    >
                                        <span>{skill}</span>
                                        <button 
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="text-slate-400 hover:text-rose-600"
                                        >
                                            <HiXMark className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "experience" && (
                        <div className="space-y-4">
                            {experience.length > 0 && (
                                <div className="space-y-2">
                                    {experience.map((exp, index) => (
                                        <div key={index} className="flex items-start justify-between gap-2 p-2.5 bg-slate-50 dark:bg-[#0f0b09] rounded-md border border-slate-200 dark:border-[#2d1c15]">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">{exp.title}</h4>
                                                <p className="text-xs font-semibold text-[#E73F1E] dark:text-[#F9B637]">{exp.company}</p>
                                                {exp.description && <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{exp.description}</p>}
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeExperience(index)}
                                                className="text-slate-400 hover:text-rose-600 p-1"
                                            >
                                                <HiOutlineTrash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-3 bg-slate-50 dark:bg-[#0f0b09] rounded-md border border-slate-200 dark:border-[#2d1c15] space-y-2">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Add Experience</h4>
                                <input 
                                    type="text" 
                                    placeholder="Title"
                                    value={newExperience.title} 
                                    onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#17120e] text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#FB6C00]"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Company"
                                    value={newExperience.company} 
                                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#17120e] text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#FB6C00]"
                                />
                                <textarea 
                                    rows={2}
                                    placeholder="Description"
                                    value={newExperience.description} 
                                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#17120e] text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#FB6C00] resize-none"
                                />
                                <button 
                                    type="button" 
                                    onClick={addExperience}
                                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#FB6C00] text-white hover:bg-[#E73F1E] transition-colors"
                                >
                                    + Add Role
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === "education" && (
                        <div className="space-y-4">
                            {education.length > 0 && (
                                <div className="space-y-2">
                                    {education.map((edu, index) => (
                                        <div key={index} className="flex items-start justify-between gap-2 p-2.5 bg-slate-50 dark:bg-[#0f0b09] rounded-md border border-slate-200 dark:border-[#2d1c15]">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">{edu.college}</h4>
                                                <p className="text-xs font-semibold text-[#E73F1E] dark:text-[#F9B637]">{edu.degree} in {edu.fieldOfStudy}</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeEducation(index)}
                                                className="text-slate-400 hover:text-rose-600 p-1"
                                            >
                                                <HiOutlineTrash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-3 bg-slate-50 dark:bg-[#0f0b09] rounded-md border border-slate-200 dark:border-[#2d1c15] space-y-2">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Add Education</h4>
                                <input 
                                    type="text" 
                                    placeholder="College / Institution"
                                    value={newEducation.college} 
                                    onChange={(e) => setNewEducation({ ...newEducation, college: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#17120e] text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#FB6C00]"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Degree"
                                    value={newEducation.degree} 
                                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#17120e] text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#FB6C00]"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Field of Study"
                                    value={newEducation.fieldOfStudy} 
                                    onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-[#2d1c15] bg-white dark:bg-[#17120e] text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#FB6C00]"
                                />
                                <button 
                                    type="button" 
                                    onClick={addEducation}
                                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#FB6C00] text-white hover:bg-[#E73F1E] transition-colors"
                                >
                                    + Add Education
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                <div className="px-5 py-3 bg-slate-50 dark:bg-[#110d0a] border-t border-slate-200 dark:border-[#2d1c15] flex items-center justify-end gap-2">
                    <button 
                        type="button"
                        onClick={() => setEdit(false)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-[#2d1c15] transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-4 py-1.5 rounded-md text-xs font-bold bg-[#FB6C00] hover:bg-[#E73F1E] text-white shadow-xs disabled:opacity-50 transition-colors"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default EditProfile;
