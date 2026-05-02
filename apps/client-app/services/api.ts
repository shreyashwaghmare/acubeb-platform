 const BASE_URL = "https://acubeb-platform-production.up.railway.app";
// ⚠️ IMPORTANT: replace localhost with your IP

export const api = {
  register: async (name: string, mobile: string) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, mobile }),
  });

  return res.json();
},
  login: async (mobile: string) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mobile }),
  });

  return res.json();
},

  getProfile: async (token: string) => {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  updateProfile: async (token: string, data: any) => {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  createRequest: async (token: string, data: any) => {
    const res = await fetch(`${BASE_URL}/api/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  getRequests: async (token: string) => {
    const res = await fetch(`${BASE_URL}/api/requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },
  
  getRequestHistory: async (token: string, id: string) => {
  const res = await fetch(`${BASE_URL}/api/requests/${id}/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
},
getReportById: async (id: any, token: string) => {
  const res = await fetch(`${BASE_URL}/api/reports/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
},
getReportByRequestId: async (requestId: string, token: string) => {
  const res = await fetch(`${BASE_URL}/api/reports/request/${requestId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
},
savePushToken: async (token: string, pushToken: string) => {
  const res = await fetch(`${BASE_URL}/api/profile/save-push-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token: pushToken }),
  });

  return res.json();
},
};