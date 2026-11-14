import demo from "./review-demo.json";
import { starCount } from "./google-business";
export type ManagedReview = { id: string; author: string; stars: number | null; comment: string; updatedAt: string | null; reply: string | null };
export const sampleReviews: ManagedReview[] = demo.reviews.map((review) => ({ id: review.reviewId, author: review.reviewer.displayName, stars: starCount(review.starRating), comment: review.comment, updatedAt: review.updateTime, reply: review.reviewReply?.comment ?? null }));
export function demoReply(review: ManagedReview, name: string, industry: string) {
  const thanks = `Thank you for sharing your experience with ${name}.`;
  return review.stars !== null && review.stars <= 3
    ? `${thanks} We are sorry your visit did not fully meet expectations. Your feedback helps us improve our ${industry.toLowerCase()} service. Please contact our team directly so we can understand what happened and discuss how to put things right.`
    : `${thanks} We are delighted you appreciated our team and ${industry.toLowerCase()} service. Your support means a lot to our local business, and we look forward to welcoming you again.`;
}
export function validateReply(comment: string, approved: boolean) {
  if (!approved) throw new Error("Approve the exact reply before posting.");
  if (!comment.trim() || comment.trim().length > 4096) throw new Error("Reply must contain between 1 and 4,096 characters.");
  return comment.trim();
}