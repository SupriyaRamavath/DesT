import api from "./api";

/*
  Get all decisions
*/
export async function getDecisions(params = {}) {
  const response = await api.get(
    "/decisions",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get a single decision
*/
export async function getDecisionById(
  decisionId
) {
  const response = await api.get(
    `/decisions/${decisionId}`
  );

  return response.data;
}

/*
  Ingest a new AI decision trace
*/
export async function ingestDecision(
  decisionData
) {
  const response = await api.post(
    "/decisions/ingest",
    decisionData
  );

  return response.data;
}

/*
  Update a decision
*/
export async function updateDecision(
  decisionId,
  decisionData
) {
  const response = await api.patch(
    `/decisions/${decisionId}`,
    decisionData
  );

  return response.data;
}

/*
  Delete a decision
*/
export async function deleteDecision(
  decisionId
) {
  const response = await api.delete(
    `/decisions/${decisionId}`
  );

  return response.data;
}

/*
  Get replay data for a decision
*/
export async function getDecisionReplay(
  decisionId
) {
  const response = await api.get(
    `/decisions/${decisionId}/replay`
  );

  return response.data;
}

/*
  Get events belonging to a decision
*/
export async function getDecisionEvents(
  decisionId
) {
  const response = await api.get(
    `/decisions/${decisionId}/events`
  );

  return response.data;
}

/*
  Add an event to a decision
*/
export async function addDecisionEvent(
  decisionId,
  eventData
) {
  const response = await api.post(
    `/decisions/${decisionId}/events`,
    eventData
  );

  return response.data;
}

/*
  Get decision statistics
*/
export async function getDecisionStats(
  params = {}
) {
  const response = await api.get(
    "/decisions/stats",
    {
      params,
    }
  );

  return response.data;
}

/*
  Flag a decision for human review
*/
export async function flagDecisionForReview(
  decisionId,
  data = {}
) {
  const response = await api.post(
    `/decisions/${decisionId}/flag-review`,
    data
  );

  return response.data;
}

export default {
  getDecisions,
  getDecisionById,
  ingestDecision,
  updateDecision,
  deleteDecision,
  getDecisionReplay,
  getDecisionEvents,
  addDecisionEvent,
  getDecisionStats,
  flagDecisionForReview,
};