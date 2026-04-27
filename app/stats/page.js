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

  const maxPostCount = stats.postsPerMonth?.length
    ? Math.max(...stats.postsPerMonth.map((m) => Number(m.post_count)))
    : 1;

  const maxWordCount = stats.topWords?.length
    ? Math.max(...stats.topWords.map((w) => w.count))
    : 1;

  return (
    <>
      {/* Reuse home header */}
      <header className="home-header">
        <div id="pic-header" style={{ cursor: "pointer" }} onClick={() => router.push(`/profile/${me?.id}`)}>
          <img id="profile-pic" src="/media/profile-picture.png" alt="profile" />
          <span id="username-header">{me?.username}</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "bold" }}>Platform Statistics</h1>
      </header>

      <main className={styles.main}>

        {/* ── STAT 1: Platform Overview ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>1. Platform Overview</h2>
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

        {/* ── STAT 2: Averages ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>2. Platform Averages</h2>
          <p className={styles.cardSub}>Computed via SQL aggregation queries</p>
          <div className={styles.averagesRow}>
            <div className={styles.averageBox}>
              <span className={styles.bigNumber}>{stats.avgFollowers}</span>
              <span className={styles.label}>Avg. Followers per User</span>
            </div>
            <div className={styles.averageBox}>
              <span className={styles.bigNumber}>{stats.avgPosts}</span>
              <span className={styles.label}>Avg. Posts per User</span>
            </div>
          </div>
        </section>

        {/* ── STAT 3: Most Active Users (last 3 months) ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>3. Most Active Users</h2>
          <p className={styles.cardSub}>Ranked by posts + comments in the last 3 months</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Posts</th>
                <th>Comments</th>
                <th>Activity Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.mostActive?.length === 0 && (
                <tr><td colSpan={5} className={styles.empty}>No data</td></tr>
              )}
              {stats.mostActive?.map((u, i) => (
                <tr key={u.id}
                  className={styles.clickRow}
                  onClick={() => router.push(`/profile/${u.id}`)}>
                  <td>{i + 1}</td>
                  <td>@{u.username}</td>
                  <td>{Number(u.post_count)}</td>
                  <td>{Number(u.comment_count)}</td>
                  <td>
                    <span className={styles.badge}>{Number(u.activity_score)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── STAT 4: Posts Per Month ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>4. Posts Per Month</h2>
          <p className={styles.cardSub}>Post volume over the last 12 months</p>
          {stats.postsPerMonth?.length === 0 ? (
            <p className={styles.empty}>No data available</p>
          ) : (
            <div className={styles.barChart}>
              {stats.postsPerMonth?.map((row) => {
                const count = Number(row.post_count);
                const pct = maxPostCount > 0 ? (count / maxPostCount) * 100 : 0;
                return (
                  <div key={row.month} className={styles.barGroup}>
                    <div className={styles.barWrap}>
                      <span className={styles.barValue}>{count}</span>
                      <div className={styles.bar} style={{ height: `${Math.max(pct, 4)}%` }} />
                    </div>
                    <span className={styles.barLabel}>{row.month?.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── STAT 5: Top Words in Posts ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>5. Top Words Used in Posts</h2>
          <p className={styles.cardSub}>Most frequent meaningful words across all post content</p>
          <div className={styles.wordCloud}>
            {stats.topWords?.length === 0 && <p className={styles.empty}>No data</p>}
            {stats.topWords?.map((w) => {
              const size = 0.8 + (w.count / maxWordCount) * 1.4;
              return (
                <span key={w.word} className={styles.word}
                  style={{ fontSize: `${size}rem`, opacity: 0.6 + (w.count / maxWordCount) * 0.4 }}>
                  {w.word}
                  <sup style={{ fontSize: "0.6rem", marginLeft: "2px", color: "#0d8ddb" }}>{w.count}</sup>
                </span>
              );
            })}
          </div>
        </section>

        {/* ── STAT 6: Influence Leaderboard ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>6. Influence Leaderboard</h2>
          <p className={styles.cardSub}>Users ranked by followers-to-following ratio</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Followers</th>
                <th>Following</th>
                <th>Influence Ratio</th>
              </tr>
            </thead>
            <tbody>
              {stats.leaderboard?.length === 0 && (
                <tr><td colSpan={5} className={styles.empty}>No data</td></tr>
              )}
              {stats.leaderboard?.map((u, i) => (
                <tr key={u.id}
                  className={styles.clickRow}
                  onClick={() => router.push(`/profile/${u.id}`)}>
                  <td>{i + 1}</td>
                  <td>@{u.username}</td>
                  <td>{Number(u.followers)}</td>
                  <td>{Number(u.following)}</td>
                  <td>
                    <span className={styles.badge} style={{ background: "#0d8ddb" }}>
                      {Number(u.influence_ratio).toFixed(2)}×
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
