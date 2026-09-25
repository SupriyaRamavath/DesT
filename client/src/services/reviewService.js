import api from "./api";

/*
  Get all reviews
*/
export async function getReviews(
  params = {}
) {
  const response = await api.get(
    "/reviews",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get review by ID
*/
export async function getReviewById(
  reviewId
) {
  const response = await api.get(
    `/reviews/${reviewId}`
  );

  return response.data;
}

/*
  Get reviews for a specific decision
*/
export async function getDecisionReviews(
  decisionId
) {
  const response = await api.get(
    `/reviews/decision/${decisionId}`
  );

  return response.data;
}

/*
  Create a review
*/
export async function createReview(
  reviewData
) {
  const response = await api.post(
    "/reviews",
    reviewData
  );

  return response.data;
}

/*
  Update a review
*/
export async function updateReview(
  reviewId,
  reviewData
) {
  const response = await api.patch(
    `/reviews/${reviewId}`,
    reviewData
  );

  return response.data;
}

/*
  Approve a decision
*/
export async function approveReview(
  reviewId,
  data = {}
) {
  const response = await api.patch(
    `/reviews/${reviewId}/approve`,
    data
  );

  return response.data;
}

/*
  Reject a decision
*/
export async function rejectReview(
  reviewId,
  data = {}
) {
  const response = await api.patch(
    `/reviews/${reviewId}/reject`,
    data
  );

  return response.data;
}

/*
  Modify a decision
*/
export async function modifyReview(
  reviewId,
  data
) {
  const response = await api.patch(
    `/reviews/${reviewId}/modify`,
    data
  );

  return response.data;
}

/*
  Delete review
*/
export async function deleteReview(
  reviewId
) {
  const response = await api.delete(
    `/reviews/${reviewId}`
  );

  return response.data;
}

export default {
  getReviews,
  getReviewById,
  getDecisionReviews,
  createReview,
  updateReview,
  approveReview,
  rejectReview,
  modifyReview,
  deleteReview,
};