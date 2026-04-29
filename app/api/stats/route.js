import { NextResponse } from "next/server";
import {
  getPlatformTotals,
  getAvgFollowersPerUser,
  getAvgPostsPerUser,
  getTopLikedPosts,
  getPostsPerMonth,
} from "@/lib/repository";

// api for stats functions
export async function GET() {
  const [totals, avgFollowers, avgPosts, topPosts, postsPerMonth] =
    await Promise.all([
      getPlatformTotals(),
      getAvgFollowersPerUser(),
      getAvgPostsPerUser(),
      getTopLikedPosts(10),
      getPostsPerMonth(),
    ]);
  
  // return stats values 
  return NextResponse.json({
    totals: totals.data ?? null,
    avgFollowers: Number(avgFollowers.data ?? 0).toFixed(2),
    avgPosts: Number(avgPosts.data ?? 0).toFixed(2),
    topPosts: topPosts.data ?? [],
    postsPerMonth: postsPerMonth.data ?? [],
  });
}
