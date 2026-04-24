import { NextResponse } from "next/server";
import {
  getPlatformTotals,
  getAvgFollowersPerUser,
  getAvgPostsPerUser,
  getMostActiveUsers,
  getTopLikedPosts,
  getTopWords,
  getPostsPerMonth,
  getInfluenceLeaderboard,
} from "@/lib/repository";

export async function GET() {
  const [totals, avgFollowers, avgPosts, mostActive, topPosts, topWords, postsPerMonth, leaderboard] =
    await Promise.all([
      getPlatformTotals(),
      getAvgFollowersPerUser(),
      getAvgPostsPerUser(),
      getMostActiveUsers(5),
      getTopLikedPosts(10),
      getTopWords(15),
      getPostsPerMonth(),
      getInfluenceLeaderboard(5),
    ]);

  return NextResponse.json({
    totals,
    avgFollowers: Number(avgFollowers).toFixed(2),
    avgPosts: Number(avgPosts).toFixed(2),
    mostActive,
    topPosts,
    topWords,
    postsPerMonth,
    leaderboard,
  });
}
