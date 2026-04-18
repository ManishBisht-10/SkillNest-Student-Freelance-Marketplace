import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageSquareText, Star } from "lucide-react";

import Button from "../../../shared/components/Button";
import { deleteAdminReview, listAdminReviews } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminReview } from "../types/admin";

function getReviewerName(entity: AdminReview["reviewerId"]) {
  return typeof entity === "string" ? entity : entity?.name || "Unknown";
}

function getRevieweeName(entity: AdminReview["revieweeId"]) {
  return typeof entity === "string" ? entity : entity?.name || "Unknown";
}

export default function AdminReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<AdminReview[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      setReviews(await listAdminReviews());
    } catch {
      toast.error("Unable to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (reviewId: string) => {
    try {
      await deleteAdminReview(reviewId);
      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
      toast.success("Review deleted");
    } catch {
      toast.error("Unable to delete review");
    }
  };

  if (loading) return <AdminPageSkeleton />;

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2)
      : "0.00";

  const flaggedCount = reviews.filter((review) => review.rating <= 2).length;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <h1 className="font-heading text-3xl font-bold text-white">Reputation Moderation</h1>
        <p className="mt-1 text-sm text-white/75">Inspect sentiment signals and remove policy-breaking review content.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Visible Reviews</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><MessageSquareText size={18} /> {reviews.length}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Average Rating</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><Star size={18} /> {averageRating}/5</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Low Rating Queue (&lt;=2)</p>
          <p className="mt-2 font-heading text-2xl font-bold text-white">{flaggedCount}</p>
        </article>
      </section>

      <section className="grid gap-3">
        {reviews.length ? (
          reviews.map((review) => (
            <article key={review._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-white">Rating {review.rating}/5</h2>
                  <p className="mt-1 text-sm text-text/70">{review.comment || "No comment"}</p>
                  <p className="mt-2 text-xs text-text/60">
                    {getReviewerName(review.reviewerId)} reviewed {getRevieweeName(review.revieweeId)} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => onDelete(review._id)}>Delete</Button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5 text-sm text-text/70">
            No reviews found.
          </div>
        )}
      </section>
    </div>
  );
}
