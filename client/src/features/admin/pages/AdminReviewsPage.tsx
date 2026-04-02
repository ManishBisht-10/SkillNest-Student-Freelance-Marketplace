import { useEffect, useState } from "react";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import { deleteAdminReview, listAdminReviews } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminReview } from "../types/admin";

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

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">Reviews Moderation</h1>
      </section>

      <section className="grid gap-3">
        {reviews.map((review) => (
          <article key={review._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-semibold text-white">Rating {review.rating}/5</h2>
                <p className="mt-1 text-sm text-text/70">{review.comment || "No comment"}</p>
              </div>
              <Button variant="ghost" onClick={() => onDelete(review._id)}>Delete</Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
