export const APP_NAME = "DesT";

export const APP_DESCRIPTION =
  "AI Decision Replay & Audit Platform";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

export const USER_ROLES = {
  ADMIN: "Admin",
  DEVELOPER: "Developer",
  REVIEWER: "Reviewer",
};

export const DECISION_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REVIEW_REQUIRED: "Review Required",
};

export const DECISION_RESULTS = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  QUALIFIED: "Qualified",
  NOT_QUALIFIED: "Not Qualified",
  REVIEW_REQUIRED: "Review Required",
};

export const RISK_LEVELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const REVIEW_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  MODIFIED: "Modified",
};

export const APPLICATION_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
};

export const EVENT_TYPES = {
  INPUT: "INPUT",
  PROCESSING: "PROCESSING",
  EVIDENCE: "EVIDENCE",
  ANALYSIS: "ANALYSIS",
  DECISION: "DECISION",
  REVIEW: "REVIEW",
  ERROR: "ERROR",
};

export const STORAGE_KEYS = {
  USER: "decisiontrace_user",
  TOKEN: "decisiontrace_token",
};

export const DEFAULT_PAGE = 1;

export const DEFAULT_LIMIT = 10;

export const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
  100,
];

export const DATE_FORMATS = {
  SHORT: "DD MMM YYYY",
  LONG: "DD MMM YYYY, hh:mm A",
};

export const API_TIMEOUT = 10000;