import api from "./api";

/*
  Get audit logs
*/
export async function getAuditLogs(
  params = {}
) {
  const response = await api.get(
    "/audit-logs",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get a specific audit log
*/
export async function getAuditLogById(
  auditLogId
) {
  const response = await api.get(
    `/audit-logs/${auditLogId}`
  );

  return response.data;
}

/*
  Get audit logs for a decision
*/
export async function getDecisionAuditLogs(
  decisionId
) {
  const response = await api.get(
    `/audit-logs/decision/${decisionId}`
  );

  return response.data;
}

/*
  Get audit logs for an application
*/
export async function getApplicationAuditLogs(
  applicationId
) {
  const response = await api.get(
    `/audit-logs/application/${applicationId}`
  );

  return response.data;
}

/*
  Get audit statistics
*/
export async function getAuditStats(
  params = {}
) {
  const response = await api.get(
    "/audit-logs/stats",
    {
      params,
    }
  );

  return response.data;
}

export default {
  getAuditLogs,
  getAuditLogById,
  getDecisionAuditLogs,
  getApplicationAuditLogs,
  getAuditStats,
};