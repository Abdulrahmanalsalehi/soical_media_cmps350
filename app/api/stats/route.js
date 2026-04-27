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
    totals: totals.data ?? null,
    avgFollowers: Number(avgFollowers.data ?? 0).toFixed(2),
    avgPosts: Number(avgPosts.data ?? 0).toFixed(2),
    mostActive: mostActive.data ?? [],
    topPosts: topPosts.data ?? [],
    topWords: topWords.data ?? [],
    postsPerMonth: postsPerMonth.data ?? [],
    leaderboard: leaderboard.data ?? [],
  });
}
