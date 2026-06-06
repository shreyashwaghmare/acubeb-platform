import { BASE_URL } from "./config";

export const api = {
  /**
   * 🌟 Fetches all requests assigned to the logged-in field operator from service_requests
   */
  getOperatorTasks: async (token: string) => {
    const targetUrl = `${BASE_URL}/operator/tasks`;
    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data?.message || `Server Error: ${response.status}` };
      }

      // Standardize payload resolution arrays cleanly
      return { success: true, data: Array.isArray(data) ? data : data?.data || [] };
    } catch (error) {
      console.error(`❌ Network failure routing to: ${targetUrl}`, error);
      return { success: false, message: "Network connection failure" };
    }
  },
  getOperatorTaskDetail: async (token: string, requestId: string) => {
  const targetUrl = `${BASE_URL}/operator/task/${requestId}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || `Server Error: ${response.status}` };
    }

    return { success: true, data: data?.data || data };
  } catch (error) {
    console.error(`❌ Network failure routing to: ${targetUrl}`, error);
    return { success: false, message: "Network connection failure" };
  }
},

getOperatorTaskHistory: async (token: string, requestId: string) => {
  const targetUrl = `${BASE_URL}/operator/task/${requestId}/history`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || `Server Error: ${response.status}` };
    }

    return { success: true, data: Array.isArray(data) ? data : data?.data || [] };
  } catch (error) {
    console.error(`❌ Network failure routing to: ${targetUrl}`, error);
    return { success: false, message: "Network connection failure" };
  }
},
/**
 * Upload photo evidence
 */
uploadPhoto: async (
  token: string,
  requestId: string,
  photoUrl: string,
  photoType: string,
  remarks: string
) => {
  const targetUrl = `${BASE_URL}/operator/upload-photo`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requestId,
        photoUrl,
        photoType,
        remarks,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || `Server Error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data?.data,
      message: data?.message,
    };
  } catch (error) {
    console.error(`❌ Upload route failure: ${targetUrl}`, error);

    return {
      success: false,
      message: "Photo upload failed",
    };
  }
},

/**
 * Get request photos
 */
getRequestPhotos: async (
  token: string,
  requestId: string
) => {
  const targetUrl = `${BASE_URL}/operator/task/${requestId}/photos`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || `Server Error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: Array.isArray(data)
        ? data
        : data?.data || [],
    };
  } catch (error) {
    console.error(`❌ Photo fetch failure: ${targetUrl}`, error);

    return {
      success: false,
      message: "Failed to load photos",
    };
  }
},
checkIn: async (
  token: string,
  requestId: string,
  latitude: number,
  longitude: number
) => {
  const targetUrl = `${BASE_URL}/operator/check-in`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requestId,
        latitude,
        longitude,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message,
      };
    }

    return {
      success: true,
      message: data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Check-in failed",
    };
  }
},createReport: async (
  token: string,
  requestId: string,
  reportNo: string,
  pdfUrl: string
) => {
  const targetUrl = `${BASE_URL}/operator/create-report`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requestId,
        reportNo,
        pdfUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || `Server Error: ${response.status}`,
      };
    }

    return {
      success: true,
      message: data?.message,
      data: data?.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Report creation failed",
    };
  }
},
updateProfile: async (
  token: string,
  name: string,
  email: string
) => {
  const response = await fetch(
    `${BASE_URL}/auth/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
      }),
    }
  );

  return await response.json();
},
firebaseLogin: async (payload: {
  firebaseToken: string;
  mobile: string;
  provider?: string;
  targetRole?: "operator";
}) => {
  const targetUrl = `${BASE_URL}/auth/firebase-login`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        targetRole: "operator",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || `Server Error: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error(`❌ Firebase login route failure: ${targetUrl}`, error);

    return {
      success: false,
      message: "Firebase login failed",
    };
  }
},
  /**
   * 🌟 Updates service_requests status and appends a row to request_status_history
   */
  mutateRequestStatus: async (token: string, requestId: string, targetStatus: string, remarksText: string) => {
    const targetUrl = `${BASE_URL}/operator/mutate-status`;
    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId,
          status: targetStatus,
          remarks: remarksText.trim() || `Status updated to ${targetStatus.replaceAll('_', ' ')} by field operator.`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data?.message || `Mutation rejected: ${response.status}` };
      }

      return { success: true, ...data };
    } catch (error) {
      console.error(`❌ Network failure routing to: ${targetUrl}`, error);
      return { success: false, message: "Failed to update asset state" };
    }
  }
};

