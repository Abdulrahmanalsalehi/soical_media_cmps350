"use client";
import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import "@/css/profile.css";

// helper function to show how much time passed since the post was created
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
   if (mins < 1) {
    return "just now";
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7){
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
}


export default function ProfilePage({ params }) {
  // state variables
  const { id } = use(params);
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ fullname: "", username: "", email: "", phone: "", bio: "" });

  // fetch current user 
  const fetchMe = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const json = await res.json();
    if (!json.data) { router.replace("/login"); return; }
    setMe(json.data);
  }, [router]);
  
  // fetch current user profile 
  const fetchProfile = useCallback(async () => {
    const res = await fetch(`/api/users/${id}`);
    const json = await res.json();
    if (json.data) setProfile(json.data);
  }, [id]);
  
  // get user posts
  const fetchPosts = useCallback(async () => {
    const res = await fetch(`/api/users/${id}/posts`);
    const json = await res.json();
    setPosts(json.data ?? []);
  }, [id]);

  const fetchFollowStatus = useCallback(async (meId) => {
    const res = await fetch(`/api/users/${id}/follow?followerId=${meId}`);
    const json = await res.json();
    setIsFollowing(json.data?.isFollowing ?? false);
  }, [id]);

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => { fetchProfile(); fetchPosts(); }, [fetchProfile, fetchPosts]);
  useEffect(() => {
    if (me && me.id !== Number(id)) fetchFollowStatus(me.id);
  }, [me, id, fetchFollowStatus]);

  const isOwnProfile = me?.id === Number(id);

  async function handleFollow() {
    const res = await fetch(`/api/users/${id}/follow`, { method: "POST" });
    if (!res.ok) return;
    const json = await res.json();
    setIsFollowing(json.data?.followed ?? false);
    fetchProfile();
  }

  async function handleLike(postId) {
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (!res.ok) return;
    const json = await res.json();
    const liked = json.data?.liked;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const likes = liked
          ? [...p.likes, { userID: me.id }]
          : p.likes.filter((l) => l.userID !== me.id);
        return { ...p, likes };
      })
    );
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => {
        if (!prev) return prev;
        const likes = liked
          ? [...prev.likes, { userID: me.id }]
          : prev.likes.filter((l) => l.userID !== me.id);
        return { ...prev, likes };
      });
    }
  }

  async function handleDelete(postId) {
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
    }
  }

  async function handleComment() {
    if (!commentInput.trim() || !selectedPost) return;
    const res = await fetch(`/api/posts/${selectedPost.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentInput.trim() }),
    });
    if (!res.ok) return;
    const json = await res.json();
    const newComment = json.data;
    setCommentInput("");
    setSelectedPost((prev) => ({
      ...prev,
      comments: [...(prev?.comments ?? []), newComment],
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPost.id
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );
  }

  function openEdit() {
    setEditForm({
      fullname: profile?.fullname ?? "",
      username: profile?.username ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      bio: profile?.bio ?? "",
    });
    setShowEdit(true);
  }

  async function handleSaveEdit() {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setShowEdit(false);
      fetchProfile();
      fetchMe();
    }
  }

  const isLiked = (post) => post.likes.some((l) => l.userID === me?.id);

  return (
    <div className="profile-page">
      <header className="profile">
        <div className="profile-header">
          <div id="pic-header" onClick={() => router.push(`/profile/${me?.id}`)}>
            <img id="profile-pic" src="/media/profile-picture.png" alt="profile" />
            <span id="username-header">{me?.username}</span>
          </div>
        </div>

        <div className="profile-info">
          <img src="/media/profile-picture.png" className="default-pic" alt="avatar" />
          <h2 id="username">{profile?.username}</h2>

          <div id="stats-header">
            <div className="stat">
              <span id="profile-posts">{posts.length}</span>
              <p>Posts</p>
            </div>
            <div className="stat">
              <span id="profile-followers">{profile?.followers?.length ?? 0}</span>
              <p>Followers</p>
            </div>
            <div className="stat">
              <span id="profile-following">{profile?.following?.length ?? 0}</span>
              <p>Following</p>
            </div>
          </div>

          <p id="bio">{profile?.bio || "No bio yet."}</p>

          {isOwnProfile ? (
            <button id="edit" onClick={openEdit}>Edit Profile</button>
          ) : (
            <button
              id="follow-button"
              onClick={handleFollow}
              style={{ background: isFollowing ? "#0d8ddb" : undefined }}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </header>

      {/* Edit modal */}
      <div id="edit-window" style={{ display: showEdit ? "flex" : "none" }}>
        <div className="window-content">
          <h3>Edit Profile</h3>
          <input type="text" id="editFullname" placeholder="Full Name"
            value={editForm.fullname} onChange={(e) => setEditForm((f) => ({ ...f, fullname: e.target.value }))} />
          <input type="text" id="editUsername" placeholder="Username"
            value={editForm.username} onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))} />
          <input type="email" id="editEmail" placeholder="Email"
            value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          <input type="text" id="editPhone" placeholder="Phone"
            value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
          <textarea id="editBio" placeholder="Bio"
            value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} />
          <div className="window-buttons">
            <button id="save" onClick={handleSaveEdit}>Save</button>
            <button id="cancel" onClick={() => setShowEdit(false)}>Cancel</button>
          </div>
        </div>
      </div>

      <div id="my-posts-heading">
        {profile?.username ? `${profile.username}'s Posts` : "Posts"}
      </div>

      <section>
        <div id="my-posts">
          {posts.length === 0 && (
            <p style={{ color: "#bbb", textAlign: "center" }}>No posts yet.</p>
          )}
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <img className="default-pic-post" src="/media/profile-picture.png" alt="avatar" />
                <div>
                  <div className="post-username">{post.author?.username}</div>
                  <div className="timestamp">{formatDate(post.createdAt)}</div>
                </div>
                {isOwnProfile && (
                  <img
                    className="delete-post"
                    src="/media/trash-2 (2).svg"
                    alt="delete"
                    width="20"
                    onClick={() => handleDelete(post.id)}
                  />
                )}
              </div>
              <div className="post-content" onClick={() => { setSelectedPost(post); setCommentInput(""); }}>
                {post.content}
              </div>
              <div className="post-actions">
                <button
                  className={`like${isLiked(post) ? " liked" : ""}`}
                  onClick={() => handleLike(post.id)}
                >
                  <img src="/media/heart.svg" alt="like"
                    style={{ filter: isLiked(post) ? "invert(30%) sepia(90%) saturate(400%) hue-rotate(-20deg) brightness(1.2)" : "invert(1)" }}
                  />
                  <span className="like-count">{post.likes.length}</span>
                </button>
                <button className="comment" onClick={() => { setSelectedPost(post); setCommentInput(""); }}>
                  <img src="/media/message-circle.svg" alt="comment" />
                  <span className="comment-count">{post.comments.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Post details window */}
      <section>
        <div id="post-window" style={{ display: selectedPost ? "flex" : "none" }}>
          <div id="post-window-content">
            <div id="arrow-back" onClick={() => setSelectedPost(null)}>
              <img src="/media/chevron-left.svg" alt="back" />
            </div>
            {selectedPost && (
              <>
                <div className="post-header">
                  <img id="detail-profile-pic" className="default-pic-post"
                    src="/media/profile-picture.png" alt="avatar" />
                  <div>
                    <div id="detail-username" className="post-username">
                      {selectedPost.author?.username}
                    </div>
                    <div id="detail-timestamp" className="timestamp">
                      {formatDate(selectedPost.createdAt)}
                    </div>
                  </div>
                </div>
                <div id="detail-content" className="box-inside-window">
                  {selectedPost.content}
                </div>
                <div className="post-actions">
                  <button
                    id="detail-like"
                    className={`like${isLiked(selectedPost) ? " liked" : ""}`}
                    onClick={() => handleLike(selectedPost.id)}
                  >
                    <img src="/media/heart.svg" alt="like"
                      style={{ filter: isLiked(selectedPost) ? "invert(30%) sepia(90%) saturate(400%) hue-rotate(-20deg) brightness(1.2)" : "invert(1)" }}
                    />
                    <span id="like-count">{selectedPost.likes.length}</span>
                  </button>
                  <button id="detail-comment" className="comment">
                    <img src="/media/message-circle.svg" alt="comment" />
                    <span id="comment-count">{selectedPost.comments.length}</span>
                  </button>
                </div>
                <div id="comments-section" style={{ display: "block" }}>
                  <p className="comments-title">Comments</p>
                  <div id="comments-list">
                    {selectedPost.comments.map((c) => (
                      <div key={c.id} className="comment-box">
                        <div className="comment-header">
                          <strong>{c.user?.username ?? "User"}</strong>
                          <span className="timestamp">{formatDate(c.createdAt)}</span>
                        </div>
                        <div className="comment-content">{c.content}</div>
                      </div>
                    ))}
                  </div>
                  <div className="add-comment">
                    <textarea id="comment-input" placeholder="Write a comment..."
                      value={commentInput} onChange={(e) => setCommentInput(e.target.value)} />
                    <button id="comment-button" onClick={handleComment}>Reply</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <nav id="nav-bars">
          <div id="nav-profile" onClick={() => router.push(`/profile/${me?.id}`)}>
            <img src="/media/person.png" className="icon" alt="profile" height="35" />
          </div>
          <div id="nav-home" onClick={() => router.push("/home")}>
            <img src="/media/home.png" className="icon" alt="home" />
          </div>
          <div id="nav-setting" onClick={() => router.push("/stats")}>
            <img src="/media/setting.png" className="icon" alt="stats" />
          </div>
          <div id="nav-search" onClick={() => router.push("/home")}>
            <img src="/media/search.png" className="icon" alt="search" />
          </div>
        </nav>
      </footer>
    </div>
  );
}
