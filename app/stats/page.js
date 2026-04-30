"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/css/home.css";
import styles from "./stats.module.css";

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    document.body.className = "home-page";
    return () => { document.body.className = ""; };
  }, []);

  useEffect(() => {
    async function load() {
      const [meRes, statsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/stats"),
      ]);
      const meJson = await meRes.json();
      if (!meJson.data) { router.replace("/login"); return; }
      setMe(meJson.data);
      const statsJson = await statsRes.json();
      setStats(statsJson);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "5rem", background: "#0d0d0d", minHeight: "100vh" }}>
        Loading statistics...
      </div>
    );
  }

  return (
    <>
      {/* Reuse home header */}
      <header className="home-header">
        <div id="pic-header" style={{ cursor: "pointer", top: "10px" }} onClick={() => router.push(`/profile/${me?.id}`)}>
          <img id="profile-pic" src="/media/profile-picture.png" alt="profile" />
          <span id="username-header">{me?.username}</span>
        </div>
      </header>

      <main className={styles.main}>

        {/* ── STAT 1: Platform Overview ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Platform Overview</h2>
          <p className={styles.cardSub}>Total counts across the entire platform</p>
          <div className={styles.overviewGrid}>
            <div className={styles.overviewItem}>
              <span className={styles.bigNumber}>{stats.totals?.users ?? 0}</span>
              <span className={styles.label}>Users</span>
            </div>
            <div className={styles.overviewItem}>
              <span className={styles.bigNumber}>{stats.totals?.posts ?? 0}</span>
              <span className={styles.label}>Posts</span>
            </div>
            <div className={styles.overviewItem}>
              <span className={styles.bigNumber}>{stats.totals?.likes ?? 0}</span>
              <span className={styles.label}>Likes</span>
            </div>
            <div className={styles.overviewItem}>
              <span className={styles.bigNumber}>{stats.totals?.comments ?? 0}</span>
              <span className={styles.label}>Comments</span>
            </div>
            <div className={styles.overviewItem}>
              <span className={styles.bigNumber}>{stats.totals?.follows ?? 0}</span>
              <span className={styles.label}>Follows</span>
            </div>
          </div>
        </section>

        {/* Avg Followers */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Avg Followers per User</h2>
          <p className={styles.cardSub}>Average number of followers across all users</p>
          <div className={styles.averageBox}>
            <span className={styles.bigNumber}>{stats.avgFollowers}</span>
            <span className={styles.label}>Avg. Followers</span>
          </div>
        </section>

        {/* Avg Posts */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}> Avg Posts per User</h2>
          <p className={styles.cardSub}>Average number of posts across all users</p>
          <div className={styles.averageBox}>
            <span className={styles.bigNumber}>{stats.avgPosts}</span>
            <span className={styles.label}>Avg. Posts</span>
          </div>
        </section>

        {/* Posts Per Month */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Posts Per Month</h2>
          <p className={styles.cardSub}>Post volume over the last 6 months</p>
          {stats.postsPerMonth?.length === 0 ? (
            <p className={styles.empty}>No data available</p>
          ) : (
            <div className={styles.monthList}>
              {stats.postsPerMonth?.map((row) => (
                <div key={row.month} className={styles.monthRow}>
                  <span className={styles.monthName}>{row.month}</span>
                  <span className={styles.badge}>{Number(row.post_count)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Liked Posts */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Top Liked Posts</h2>
          <p className={styles.cardSub}>The 3 most liked posts on the platform</p>
          {stats.topPosts?.length === 0 ? (
            <p className={styles.empty}>No posts yet</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Author</th>
                  <th>Likes</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPosts?.slice(0, 3).map((post, i) => (
                  <tr key={post.id} className={styles.clickRow}>
                    <td>{i + 1}</td>
                    <td>{post.author?.username ?? "—"}</td>
                    <td><span className={styles.badge}>{post.likes?.length ?? 0}</span></td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {post.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

      </main>

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
            <img src="/media/setting.png" className="icon" alt="stats" style={{ filter: "invert(1) sepia(1) saturate(3) hue-rotate(180deg)" }} />
          </div>
          <div id="nav-search" onClick={() => router.push("/home")}>
            <img src="/media/search.png" className="icon" alt="search" />
          </div>
        </nav>
      </footer>
    </>
  );
}
