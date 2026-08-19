import React, { useState, useRef, useEffect, useContext } from 'react';
import dp from "../assets/dp.webp";
import axios from 'axios';
import { 
    HiHandThumbUp,
    HiOutlineHandThumbUp,
    HiOutlineChatBubbleOvalLeftEllipsis, 
    HiPaperAirplane,
    HiOutlineTrash
} from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import moment from "moment";
import { authDataContext } from '../context/AuthContext.jsx';
import { userDataContext } from '../context/UserContext.jsx';
import ConnectButton from './ConnectButton.jsx';
import { socket } from '../../socket.js';

function Post(props) {
    const postData = props.post || props;
    const id = postData._id || postData.id;
    const author = postData.author;
    const description = postData.description || "";
    const image = postData.image;
    const createdAt = postData.createdAt;

    const [more, setMore] = useState(false);
    const [isLarge, setIsLarge] = useState(false);
    const [likes, setLikes] = useState(postData.like || []);
    const [comments, setComments] = useState(postData.comment || []);
    const [commentContent, setCommentContent] = useState("");
    const [showComment, setShowComment] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const textRef = useRef(null);
    const { serverUrl } = useContext(authDataContext);
    const { userData, handleGetProfile, setPostData } = useContext(userDataContext);

    const isAuthor = userData?._id && (
        (typeof author === 'object' && author?._id === userData._id) ||
        author === userData._id
    );

    const isLiked = userData?._id ? likes.some(uid => (uid?._id || uid) === userData._id) : false;

    useEffect(() => {
        if (postData.like) {
            setLikes(postData.like);
        }
    }, [postData.like]);

    useEffect(() => {
        if (postData.comment) {
            setComments(postData.comment);
        }
    }, [postData.comment]);

    useEffect(() => {
        if (textRef.current) {
            const scrollHeight = textRef.current.scrollHeight;
            setIsLarge(scrollHeight > 90);
        }
    }, [description]);

    const handleLike = async () => {
        if (!userData?._id || !id) return;

        const previousLikes = [...likes];
        if (isLiked) {
            setLikes(likes.filter(uid => (uid?._id || uid) !== userData._id));
        } else {
            setLikes([...likes, userData._id]);
        }

        try {
            const result = await axios.get(`${serverUrl}/api/post/like/${id}`, { withCredentials: true });
            if (result.data?.like) {
                setLikes(result.data.like);
            }
        } catch (error) {
            console.log("Like error:", error);
            setLikes(previousLikes);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentContent.trim() || !id) return;

        setSubmittingComment(true);
        try {
            const result = await axios.post(`${serverUrl}/api/post/comment/${id}`, {
                content: commentContent
            }, { withCredentials: true });

            setCommentContent("");
            if (result.data?.comment) {
                setComments(result.data.comment);
            }
        } catch (error) {
            console.log("Comment error:", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDelete = async () => {
        if (!id || deleting) return;
        setDeleting(true);
        try {
            await axios.delete(`${serverUrl}/api/post/delete/${id}`, { withCredentials: true });
            setPostData(prev => prev.filter(p => (p._id || p.id) !== id));
        } catch (err) {
            console.log("Delete post error:", err);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    useEffect(() => {
        const handleLikeUpdated = ({ postId, likes: updatedLikes }) => {
            if (postId === id) {
                setLikes(updatedLikes || []);
            }
        };

        const handleCommentAdded = ({ postId, comment: updatedComments }) => {
            if (postId === id) {
                setComments(updatedComments || []);
            }
        };

        socket.on("likeUpdated", handleLikeUpdated);
        socket.on("commentAdded", handleCommentAdded);

        return () => {
            socket.off("likeUpdated", handleLikeUpdated);
            socket.off("commentAdded", handleCommentAdded);
        };
    }, [id]);

    const authorName = author?.firstName 
        ? `${author.firstName} ${author.lastName || ''}`.trim()
        : "Member";

    const authorHeadline = author?.headline || (author?.userName ? `@${author.userName}` : "Conexis Member");
    const authorImage = author?.profileImage || dp;

    return (
        <article className="w-full bg-white dark:bg-[#17120e] rounded-lg border border-slate-200 dark:border-[#2d1c15] shadow-xs transition-colors overflow-hidden flex flex-col">
            
            <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                <div 
                    onClick={() => author?.userName && handleGetProfile(author.userName)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                >
                    <img 
                        src={authorImage} 
                        alt={authorName} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-100 group-hover:text-[#FB6C00] dark:group-hover:text-[#F9B637] transition-colors truncate">
                            {authorName}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {authorHeadline}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            <FiClock className="w-3 h-3" />
                            <span>{moment(createdAt).fromNow()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {userData?._id && author?._id && userData._id !== author._id && (
                        <ConnectButton userId={author._id} />
                    )}

                    {isAuthor && (
                        <div className="relative">
                            {showDeleteConfirm ? (
                                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-md border border-rose-200 dark:border-rose-900/60">
                                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold pl-1">Delete?</span>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors disabled:opacity-50"
                                    >
                                        {deleting ? "..." : "Yes"}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={deleting}
                                        className="px-1.5 py-0.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 text-[10px]"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                                    title="Delete post"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {description && (
                <div className="px-3.5 sm:px-4 pb-3">
                    <p 
                        ref={textRef} 
                        className={`text-slate-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                            !more && isLarge ? 'line-clamp-3' : ''
                        }`}
                    >
                        {description}
                    </p>
                    {isLarge && (
                        <button 
                            onClick={() => setMore(!more)}
                            className="text-xs font-semibold text-[#FB6C00] dark:text-[#F9B637] hover:underline mt-1 focus:outline-none"
                        >
                            {more ? 'Show less' : 'Read more...'}
                        </button>
                    )}
                </div>
            )}

            {image && (
                <div className="w-full bg-slate-100 dark:bg-[#0f0b09] max-h-[460px] overflow-hidden flex items-center justify-center border-y border-slate-100 dark:border-[#2d1c15]">
                    <img 
                        src={image} 
                        alt="Post media" 
                        className="w-full h-auto max-h-[460px] object-cover"
                        loading="lazy"
                    />
                </div>
            )}

            <div className="px-3.5 sm:px-4 py-2 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-[#2d1c15]">
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#FB6C00]/10 dark:bg-[#FB6C00]/20 flex items-center justify-center text-[#E73F1E] dark:text-[#F9B637]">
                        <HiHandThumbUp className="w-2.5 h-2.5" />
                    </span>
                    <span className="font-medium text-slate-600 dark:text-zinc-300">
                        {likes.length} {likes.length === 1 ? 'like' : 'likes'}
                    </span>
                </div>
                <div>
                    <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
                </div>
            </div>

            <div className="px-2 py-1 flex items-center justify-around gap-1 sm:gap-2">
                <button 
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                        isLiked 
                            ? "text-[#E73F1E] dark:text-[#F9B637] bg-[#FB6C00]/15 dark:bg-[#FB6C00]/25 font-bold" 
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#2d1c15] hover:text-slate-900 dark:hover:text-zinc-100"
                    }`}
                >
                    {isLiked ? (
                        <HiHandThumbUp className="w-4 h-4 text-[#E73F1E] dark:text-[#F9B637]" />
                    ) : (
                        <HiOutlineHandThumbUp className="w-4 h-4" />
                    )}
                    <span>{isLiked ? "Liked" : "Like"}</span>
                </button>

                <button 
                    onClick={() => setShowComment(prev => !prev)}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                        showComment 
                            ? "text-[#E73F1E] dark:text-[#F9B637] bg-[#FB6C00]/15 dark:bg-[#FB6C00]/25 font-bold" 
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#2d1c15] hover:text-slate-900 dark:hover:text-zinc-100"
                    }`}
                >
                    <HiOutlineChatBubbleOvalLeftEllipsis className="w-4 h-4" />
                    <span>Comment</span>
                </button>
            </div>

            {showComment && (
                <div className="bg-slate-50 dark:bg-[#0f0b09] p-3 sm:p-4 border-t border-slate-100 dark:border-[#2d1c15] space-y-3">
                    <form onSubmit={handleComment} className="flex items-center gap-2">
                        <img 
                            src={userData?.profileImage || dp} 
                            alt="You" 
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] shrink-0"
                        />
                        <div className="flex-1 relative flex items-center">
                            <input 
                                type="text"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-white dark:bg-[#17120e] text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm pl-3 pr-9 py-1.5 rounded-md border border-slate-200 dark:border-[#2d1c15] focus:border-[#FB6C00] focus:outline-none focus:ring-2 focus:ring-[#FB6C00]/15"
                            />
                            <button 
                                type="submit"
                                disabled={submittingComment || !commentContent.trim()}
                                className="absolute right-2 p-1 text-[#FB6C00] dark:text-[#F9B637] hover:text-[#E73F1E] disabled:text-slate-300 dark:disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiPaperAirplane className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>

                    {comments.length > 0 ? (
                        <div className="space-y-2 pt-1">
                            {comments.map((com, index) => (
                                <div key={com._id || index} className="flex items-start gap-2">
                                    <img 
                                        src={com.user?.profileImage || dp} 
                                        alt={com.user?.firstName || "User"} 
                                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-[#2d1c15] mt-0.5 shrink-0"
                                    />
                                    <div className="flex-1 bg-white dark:bg-[#17120e] p-2.5 rounded-md border border-slate-200 dark:border-[#2d1c15]">
                                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                                            {com.user ? `${com.user.firstName} ${com.user.lastName || ''}`.trim() : "Member"}
                                        </p>
                                        <p className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                                            {com.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-center text-slate-400 dark:text-zinc-500 py-1">
                            No comments yet.
                        </p>
                    )}
                </div>
            )}

        </article>
    );
}

export default Post;
