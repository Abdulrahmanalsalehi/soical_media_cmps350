"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import "@/css/home.css";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [feedMode, setFeedMode] = useState("all");
  const [postInput, setPostInput] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    document.body.className = "home-page";
    return () => { document.body.className = ""; };
  }, []);

  const fetchMe = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const json = await res.json();
    if (!json.data) { router.replace("/login"); return; }
    setMe(json.data);
  }, [router]);

  const fetchPosts = useCallback(async (mode) => {
    const url = mode === "following" ? "/api/posts/feed" : "/api/posts";
    const res = await fetch(url);
    const json = await res.json();
    setPosts(json.data ?? []);
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => { fetchPosts(feedMode); }, [feedMode, fetchPosts]);

  async function handlePost() {
    if (!postInput.trim()) return;
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: postInput.trim() }),
    });
    if (res.ok) {
      setPostInput("");
      fetchPosts(feedMode);
    }
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

  function openPost(post) {
    setSelectedPost(post);
    setCommentInput("");
  }

  async function handleSearch(q) {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    setSearchResults(json.data ?? []);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const isLiked = (post) => post.likes.some((l) => l.userID === me?.id);

  return (
    <>
      {/* Header */}
      <header className="home-header">
        <div id="pic-header" onClick={() => router.push(`/profile/${me?.id}`)}>
          <img id="profile-pic" src="/media/profile-picture.png" alt="profile" />
          <span id="username-header">{me?.username}</span>
        </div>

        <div id="stats-header">
          <div className="stat">
            <span id="posts-count">{me?.posts?.length ?? 0}</span>
            <p>Posts</p>
          </div>
          <div className="stat">
            <span id="followers-count">{me?.followers?.length ?? 0}</span>
            <p>Followers</p>
          </div>
          <div className="stat">
            <span id="following-count">{me?.following?.length ?? 0}</span>
            <p>Following</p>
          </div>
        </div>

        <div id="logout-header" onClick={() => setShowLogout(true)}>
          <img src="/media/log-out.svg" alt="logout" />
        </div>
      </header>

      {/* Logout modal */}
      <div id="logout-window" style={{ display: showLogout ? "flex" : "none" }}>
        <div id="logout-popup">
          <p>Are you sure you want to logout?</p>
          <div id="buttons">
            <button id="Yes" onClick={handleLogout}>Yes</button>
            <button id="No" onClick={() => setShowLogout(false)}>No</button>
          </div>
        </div>
      </div>

      {/* Create post */}
      <section>
        <div id="create-post">
          <textarea
            id="post-input"
            placeholder="What's on your mind?"
            value={postInput}
            onChange={(e) => setPostInput(e.target.value)}
          />
          <button id="post-button" onClick={handlePost}>Post</button>
        </div>
      </section>

      {/* Feed filter */}
      <div className="feed-filter">
        <button
          id="all-posts"
          className={feedMode === "all" ? "active" : ""}
          onClick={() => setFeedMode("all")}
        >
          All Posts
        </button>
        <button
          id="following-posts"
          className={feedMode === "following" ? "active" : ""}
          onClick={() => setFeedMode("following")}
        >
          Following
        </button>
      </div>

      {/* Feed */}
      <section>
        <div className="feed" id="feed">
          {posts.length === 0 && (
            <p style={{ color: "#bbb", textAlign: "center", marginTop: "2rem" }}>
              {feedMode === "following" ? "Follow someone to see their posts here." : "No posts yet."}
            </p>
          )}
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <img
                  className="default-pic-post"
                  src="/media/profile-picture.png"
                  alt="avatar"
                  onClick={() => router.push(`/profile/${post.author.id}`)}
                />
                <div>
                  <div
                    className="post-username"
                    onClick={() => router.push(`/profile/${post.author.id}`)}
                  >
                    {post.author.username}
                  </div>
                  <div className="timestamp">{formatDate(post.createdAt)}</div>
                </div>
                {post.author.id === me?.id && (
                  <img
                    className="delete-post"
                    src="/media/trash-2 (2).svg"
                    alt="delete"
                    width="20"
                    onClick={() => handleDelete(post.id)}
                  />
                )}
              </div>
              <div className="post-content" onClick={() => openPost(post)}>
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
                <button className="comment" onClick={() => openPost(post)}>
                  <img src="/media/message-circle.svg" alt="comment" />
                  <span className="comment-count">{post.comments.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Post detail modal */}
      <section>
        <div id="post-window" style={{ display: selectedPost ? "flex" : "none" }}>
          <div id="post-window-content">
            <div id="arrow-back" onClick={() => setSelectedPost(null)}>
              <img src="/media/chevron-left.svg" alt="back" />
            </div>
            {selectedPost && (
              <>
                <div className="post-header">
                  <img
                    id="detail-profile-pic"
                    className="default-pic-post"
                    src="/media/profile-picture.png"
                    alt="avatar"
                  />
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
                    <textarea
                      id="comment-input"
                      placeholder="Write a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <button id="comment-button" onClick={handleComment}>Reply</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Search overlay */}
      {showSearch && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "flex-start",
          paddingTop: "80px",
        }}>
          <div style={{
            background: "#2b2b2b", borderRadius: "12px", padding: "20px",
            width: "90%", maxWidth: "400px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#fff", fontWeight: "bold" }}>Search Users</span>
              <span style={{ color: "#bbb", cursor: "pointer" }} onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}>✕</span>
            </div>
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", marginBottom: "12px" }}
            />
            {searchResults.map((u) => (
              <div key={u.id}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", cursor: "pointer", borderRadius: "6px", color: "#fff" }}
                onClick={() => { router.push(`/profile/${u.id}`); setShowSearch(false); }}
              >
                <img src="/media/profile-picture.png" width="36" height="36" style={{ borderRadius: "50%" }} alt="avatar" />
                <div>
                  <div style={{ fontWeight: "bold" }}>{u.username}</div>
                  <div style={{ fontSize: "0.8rem", color: "#bbb" }}>{u.fullname}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <div id="nav-search" onClick={() => setShowSearch(true)}>
            <img src="/media/search.png" className="icon" alt="search" />
          </div>
        </nav>
      </footer>
    </>
  );
}
