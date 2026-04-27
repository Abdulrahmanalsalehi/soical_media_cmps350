import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { join } from "path";
import { pathToFileURL } from "url";

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  const isValid = raw && raw !== "undefined" && raw !== "null" && raw.length > 0;
  const url = isValid
    ? raw
    : pathToFileURL(join(process.cwd(), "dev.db")).href;
  const libsql = createClient({ url });
  const adapter = new PrismaLibSql(libsql);
  return new PrismaClient({ adapter });
}

// Always recreate in dev so config changes are picked up on server restart
const globalForPrisma = globalThis;
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = undefined;
}
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ****************** AUTH ******************

export async function getUserByEmail(email) {
  try {
    const data = await prisma.user.findUnique({ where: { email } });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getUserByUsername(username) {
  try {
    const data = await prisma.user.findUnique({ where: { username } });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function createUser(data) {
  try {
    const result = await prisma.user.create({ data });
    return { data: result };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// ****************** USERS ******************

export async function getUserProfile(userId) {
  try {
    const data = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: { orderBy: { createdAt: "desc" } },
        followers: true,
        following: true,
      },
    });
    if (!data) return { error: { message: "User not found", status: 404 } };
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function updateUserProfile(userId, payload) {
  try {
    const data = await prisma.user.update({
      where: { id: userId },
      data: payload,
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function searchUsers(query) {
  try {
    const data = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { fullname: { contains: query } },
        ],
      },
      include: { followers: true },
      take: 20,
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// ****************** POSTS ******************

export async function getAllPosts(viewerUserId) {
  try {
    const data = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: viewerUserId ? { where: { userID: viewerUserId } } : true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getPostById(postId, viewerUserId) {
  try {
    const data = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        likes: viewerUserId ? { where: { userID: viewerUserId } } : true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
    if (!data) return { error: { message: "Post not found", status: 404 } };
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getUserPosts(userId, viewerUserId) {
  try {
    const data = await prisma.post.findMany({
      where: { authorID: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: viewerUserId ? { where: { userID: viewerUserId } } : true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getFollowingFeed(userId) {
  try {
    const data = await prisma.post.findMany({
      where: {
        author: {
          followers: { some: { followerID: userId } },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: { where: { userID: userId } },
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function createPost(authorId, content) {
  try {
    const data = await prisma.post.create({
      data: { authorID: authorId, content },
      include: { author: true, likes: true, comments: true },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function deletePost(postId, authorId) {
  try {
    const data = await prisma.post.deleteMany({
      where: { id: postId, authorID: authorId },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// ****************** LIKES ******************

export async function toggleLike(userId, postId) {
  try {
    const existing = await prisma.like.findUnique({
      where: { userID_postID: { userID: userId, postID: postId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return { data: false };
    }
    await prisma.like.create({ data: { userID: userId, postID: postId } });
    return { data: true };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// ****************** COMMENTS ******************

export async function addComment(userId, postId, content) {
  try {
    const data = await prisma.comment.create({
      data: { userID: userId, postID: postId, content },
      include: { user: true },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// ****************** FOLLOWS ******************

export async function toggleFollow(followerId, followingId) {
  try {
    const existing = await prisma.follow.findUnique({
      where: { followerID_followingID: { followerID: followerId, followingID: followingId } },
    });
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return { data: false };
    }
    await prisma.follow.create({ data: { followerID: followerId, followingID: followingId } });
    return { data: true };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function isFollowing(followerId, followingId) {
  try {
    const record = await prisma.follow.findUnique({
      where: { followerID_followingID: { followerID: followerId, followingID: followingId } },
    });
    return { data: !!record };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// ****************** STATISTICS ******************

export async function getAvgFollowersPerUser() {
  try {
    const result = await prisma.$queryRaw`
      SELECT CAST(COUNT(*) AS REAL) / (SELECT COUNT(*) FROM users) AS avg_followers FROM follows
    `;
    return { data: Number(result[0]?.avg_followers ?? 0) };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getAvgPostsPerUser() {
  try {
    const result = await prisma.$queryRaw`
      SELECT CAST(COUNT(*) AS REAL) / (SELECT COUNT(*) FROM users) AS avg_posts FROM posts
    `;
    return { data: Number(result[0]?.avg_posts ?? 0) };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getMostActiveUsers(limit = 5) {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const rows = await prisma.$queryRaw`
      SELECT
        u.id, u.username, u.fullname, u.avatar,
        COUNT(DISTINCT p.id)                        AS post_count,
        COUNT(DISTINCT c.id)                        AS comment_count,
        COUNT(DISTINCT p.id) + COUNT(DISTINCT c.id) AS activity_score
      FROM users u
      LEFT JOIN posts    p ON p.authorID = u.id AND p.createdAt >= ${threeMonthsAgo.toISOString()}
      LEFT JOIN comments c ON c.userID   = u.id AND c.createdAt >= ${threeMonthsAgo.toISOString()}
      GROUP BY u.id, u.username, u.fullname, u.avatar
      ORDER BY activity_score DESC
      LIMIT ${limit}
    `;
    const data = rows.map((u) => ({
      ...u,
      id: Number(u.id),
      post_count: Number(u.post_count),
      comment_count: Number(u.comment_count),
      activity_score: Number(u.activity_score),
    }));
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getTopLikedPosts(limit = 10) {
  try {
    const data = await prisma.post.findMany({
      orderBy: { likes: { _count: "desc" } },
      take: limit,
      include: { author: true, likes: true, comments: true },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getTopWords(limit = 15) {
  try {
    const posts = await prisma.post.findMany({ select: { content: true } });
    const stopwords = new Set([
      "a","an","the","and","or","but","is","it","in","on","at","to","for","of",
      "with","i","my","me","you","your","we","they","this","that","was","be",
      "are","so","just","have","do","get","got","its","as","by","up","not","all",
      "from","what","if","he","she","her","his","who",
    ]);
    const freq = {};
    for (const { content } of posts) {
      const words = content.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
      for (const word of words) {
        if (word.length > 2 && !stopwords.has(word)) {
          freq[word] = (freq[word] ?? 0) + 1;
        }
      }
    }
    const data = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getPostsPerMonth() {
  try {
    const rows = await prisma.$queryRaw`
      SELECT strftime('%Y-%m', createdAt) AS month, COUNT(*) AS post_count
      FROM posts
      WHERE createdAt >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `;
    const data = rows.map((r) => ({ month: r.month, post_count: Number(r.post_count) }));
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getInfluenceLeaderboard(limit = 5) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        u.id, u.username, u.fullname, u.avatar,
        COUNT(DISTINCT f1.followerID)  AS followers,
        COUNT(DISTINCT f2.followingID) AS following,
        CASE
          WHEN COUNT(DISTINCT f2.followingID) = 0 THEN COUNT(DISTINCT f1.followerID)
          ELSE ROUND(CAST(COUNT(DISTINCT f1.followerID) AS REAL) / COUNT(DISTINCT f2.followingID), 2)
        END AS influence_ratio
      FROM users u
      LEFT JOIN follows f1 ON f1.followingID = u.id
      LEFT JOIN follows f2 ON f2.followerID  = u.id
      GROUP BY u.id, u.username, u.fullname, u.avatar
      ORDER BY influence_ratio DESC
      LIMIT ${limit}
    `;
    const data = rows.map((u) => ({
      ...u,
      id: Number(u.id),
      followers: Number(u.followers),
      following: Number(u.following),
      influence_ratio: Number(u.influence_ratio),
    }));
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

export async function getPlatformTotals() {
  try {
    const [users, posts, likes, comments, follows] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.like.count(),
      prisma.comment.count(),
      prisma.follow.count(),
    ]);
    return { data: { users, posts, likes, comments, follows } };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}
