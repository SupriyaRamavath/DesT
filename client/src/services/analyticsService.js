import api from "./api";

/*
  Get dashboard overview
*/
export async function getDashboardStats(
  params = {}
) {
  const response = await api.get(
    "/analytics/dashboard",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get decision analytics
*/
export async function getDecisionAnalytics(
  params = {}
) {
  const response = await api.get(
    "/analytics/decisions",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get risk analytics
*/
export async function getRiskAnalytics(
  params = {}
) {
  const response = await api.get(
    "/analytics/risk",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get confidence analytics
*/
export async function getConfidenceAnalytics(
  params = {}
) {
  const response = await api.get(
    "/analytics/confidence",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get application analytics
*/
export async function getApplicationAnalytics(
  params = {}
) {
  const response = await api.get(
    "/analytics/applications",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get review analytics
*/
export async function getReviewAnalytics(
  params = {}
) {
  const response = await api.get(
    "/analytics/reviews",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get analytics summary
*/
export async function getAnalyticsSummary(
  params = {}
) {
  const response = await api.get(
    "/analytics/summary",
    {
      params,
    }
  );

  return response.data;
}

export default {
  getDashboardStats,
  getDecisionAnalytics,
  getRiskAnalytics,
  getConfidenceAnalytics,
  getApplicationAnalytics,
  getReviewAnalytics,
  getAnalyticsSummary,
};