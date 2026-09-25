import api from "./api";

/*
  Get all AI applications
*/
export async function getApplications(
  params = {}
) {
  const response = await api.get(
    "/applications",
    {
      params,
    }
  );

  return response.data;
}

/*
  Get application by ID
*/
export async function getApplicationById(
  applicationId
) {
  const response = await api.get(
    `/applications/${applicationId}`
  );

  return response.data;
}

/*
  Create a new AI application
*/
export async function createApplication(
  applicationData
) {
  const response = await api.post(
    "/applications",
    applicationData
  );

  return response.data;
}

/*
  Update an AI application
*/
export async function updateApplication(
  applicationId,
  applicationData
) {
  const response = await api.patch(
    `/applications/${applicationId}`,
    applicationData
  );

  return response.data;
}

/*
  Delete an AI application
*/
export async function deleteApplication(
  applicationId
) {
  const response = await api.delete(
    `/applications/${applicationId}`
  );

  return response.data;
}

/*
  Activate an application
*/
export async function activateApplication(
  applicationId
) {
  const response = await api.patch(
    `/applications/${applicationId}/activate`
  );

  return response.data;
}

/*
  Deactivate an application
*/
export async function deactivateApplication(
  applicationId
) {
  const response = await api.patch(
    `/applications/${applicationId}/deactivate`
  );

  return response.data;
}

/*
  Get application statistics
*/
export async function getApplicationStats(
  applicationId
) {
  const response = await api.get(
    `/applications/${applicationId}/stats`
  );

  return response.data;
}

export default {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  activateApplication,
  deactivateApplication,
  getApplicationStats,
};