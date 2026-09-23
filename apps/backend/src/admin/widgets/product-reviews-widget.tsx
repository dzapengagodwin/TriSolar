import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  IconButton,
  Table,
  Badge,
  StatusBadge,
  Prompt,
  toast,
  clx,
} from "@medusajs/ui"
import { Trash } from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"

type ProductReview = {
  id: string
  title?: string | null
  content: string
  rating: number
  first_name: string
  last_name: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

type ProductReviewsWidgetProps = {
  data: {
    id: string
    title?: string
  }
}

const ProductReviewsWidget = ({ data }: ProductReviewsWidgetProps) => {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [count, setCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [reviewToDelete, setReviewToDelete] = useState<ProductReview | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    if (!data?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/products/${data.id}/reviews`, {
        credentials: "include",
      })
      if (res.ok) {
        const json = await res.json()
        setReviews(json.reviews || [])
        setCount(json.count || 0)
        setAverageRating(json.average_rating || 0)
      }
    } catch (err) {
      console.error("Failed to load product reviews:", err)
    } finally {
      setLoading(false)
    }
  }, [data?.id])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleUpdateStatus = async (
    review: ProductReview,
    status: "approved" | "rejected" | "pending"
  ) => {
    setUpdatingId(review.id)
    try {
      const res = await fetch(`/admin/products/${data.id}/reviews/${review.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to update review status")
      }

      toast.success("Status Updated", {
        description: `Review marked as ${status}.`,
      })
      fetchReviews()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update"
      toast.error("Error", { description: msg })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(
        `/admin/products/${data.id}/reviews/${reviewToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete review")
      }

      toast.success("Review Deleted", {
        description: "Customer review has been removed.",
      })
      setReviewToDelete(null)
      fetchReviews()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete"
      toast.error("Error", { description: msg })
    } finally {
      setDeleting(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={clx(
              "w-3.5 h-3.5",
              star <= Math.round(rating)
                ? "text-amber-500 fill-amber-500"
                : "text-ui-fg-muted fill-transparent"
            )}
            viewBox="0 0 20 20"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <Container className="divide-y p-0 overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Heading level="h2">Product Reviews</Heading>
          {!loading && count > 0 && (
            <div className="flex items-center gap-2">
              <Badge size="2xsmall" color="blue">
                {count} {count === 1 ? "review" : "reviews"}
              </Badge>
              <Badge size="2xsmall" color="orange">
                {averageRating} / 5
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <Text className="text-ui-fg-subtle text-sm">Loading reviews...</Text>
        ) : reviews.length === 0 ? (
          <div className="py-6 text-center">
            <Text className="text-ui-fg-subtle text-sm">
              No customer reviews have been submitted for this product.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Rating</Table.HeaderCell>
                <Table.HeaderCell>Review</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {reviews.map((rev) => {
                const dateStr = new Date(rev.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })

                return (
                  <Table.Row key={rev.id}>
                    <Table.Cell className="font-medium text-xs text-ui-fg-base">
                      {rev.first_name} {rev.last_name}
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex items-center gap-1.5">
                        {renderStars(rev.rating)}
                        <span className="text-xs text-ui-fg-subtle font-mono">
                          {rev.rating}
                        </span>
                      </div>
                    </Table.Cell>

                    <Table.Cell className="max-w-xs">
                      {rev.title && (
                        <p className="font-medium text-xs text-ui-fg-base truncate">
                          {rev.title}
                        </p>
                      )}
                      <p className="text-xs text-ui-fg-subtle line-clamp-2">
                        {rev.content}
                      </p>
                    </Table.Cell>

                    <Table.Cell>
                      <StatusBadge
                        color={
                          rev.status === "approved"
                            ? "green"
                            : rev.status === "pending"
                            ? "orange"
                            : "red"
                        }
                      >
                        {rev.status.charAt(0).toUpperCase() + rev.status.slice(1)}
                      </StatusBadge>
                    </Table.Cell>

                    <Table.Cell className="text-xs text-ui-fg-muted">
                      {dateStr}
                    </Table.Cell>

                    <Table.Cell className="text-right space-x-1.5 whitespace-nowrap">
                      {rev.status !== "approved" && (
                        <Button
                          variant="secondary"
                          size="small"
                          disabled={updatingId === rev.id}
                          onClick={() => handleUpdateStatus(rev, "approved")}
                        >
                          Approve
                        </Button>
                      )}
                      {rev.status !== "rejected" && (
                        <Button
                          variant="secondary"
                          size="small"
                          disabled={updatingId === rev.id}
                          onClick={() => handleUpdateStatus(rev, "rejected")}
                        >
                          Reject
                        </Button>
                      )}
                      <IconButton
                        variant="transparent"
                        size="small"
                        className="text-ui-fg-muted hover:text-ui-fg-danger"
                        onClick={() => setReviewToDelete(rev)}
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Delete Confirmation Prompt */}
      <Prompt
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
      >
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete Review</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete this review by &quot;
              {reviewToDelete?.first_name} {reviewToDelete?.last_name}&quot;? This
              action cannot be undone.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel disabled={deleting}>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={handleDeleteReview} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductReviewsWidget

