import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// create prisma client
function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis;
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = undefined;
}
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}




// ****************** AUTH ******************

// takes an email and return a user
export async function getUserByEmail(email) {
  try {
    const data = await prisma.user.findUnique({ where: { email } });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}
// takes an username and return a user 
export async function getUserByUsername(username) {
  try {
    const data = await prisma.user.findUnique({ where: { username } });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}
// takes data (from user input) and create a user 
export async function createUser(data) {
  try {
    const result = await prisma.user.create({ data });
    return { data: result };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// ****************** USERS ******************

// takes userID and returns its profile including posts followers amd following 
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
    if (!data) {
      return { error: { message: "User not found", status: 404 } };
    }
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}
// update user profile based on payload (what will change)
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
// find a user based on a query up to 20 users
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

// all posts that apear in the viwed user feed
export async function getAllPosts(viewerUserId) {
  try {
    const data = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}
// return a specific post that apear in user feed 
export async function getPostById(postId, viewerUserId) {
  try {
    const data = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        likes: true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
    if (!data) return { error: { message: "Post not found", status: 404 } };
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// get posts that belong to this specific user 
export async function getUserPosts(userId, viewerUserId) {
  try {
    const data = await prisma.post.findMany({
      where: { authorID: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}
// get posts from users which the viewing user is following
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
        likes: true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
    return { data };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}
// create post the belongs to the user along with content 
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
// delete a post that belong to the user 
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

// like behaviour
export async function toggleLike(userId, postId) {
  try {
    // chech if the user already liked the post
    const existing = await prisma.like.findUnique({
      where: { userID_postID: { userID: userId, postID: postId } },
    });
    // remove it, this will show toggle effect
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return { data: false };
    }
    // or create it 
    await prisma.like.create({ data: { userID: userId, postID: postId } });
    return { data: true };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// ****************** COMMENTS ******************

// add comment to a post 
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
    // chech if the user is already following this user 
    const existing = await prisma.follow.findUnique({
      where: { followerID_followingID: { followerID: followerId, followingID: followingId } },
    });
    // remove it, if it exists
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return { data: false };
    }
    // or create it 
    await prisma.follow.create({ data: { followerID: followerId, followingID: followingId } });
    return { data: true };
  } catch (e) {
    return { error: { message: e.message, status: 500 } };
  }
}

// check if the user is following user is followed 
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

// this count total number of follow relashionships in follow table then divide by total users 
// to get the average followers per user 
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
// count how many total posts and then divide by total number of users 
// this will show on avg how many posts that user might have 
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

// show the post who has the most liked 
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

// show the number of posts every month 
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

// state will show total users, posts, likes, comments, follows
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
