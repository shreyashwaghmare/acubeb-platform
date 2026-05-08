 //const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
 //const BASE_URL="http://192.168.1.6:5050";
// ⚠️ IMPORTANT: replace localhost with your IP
const BASE_URL =  "https://acubeb-platform-production.up.railway.app";
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
  const res = await fetch(`${BASE_URL}/api/requests?t=${Date.now()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
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
getReports: async (token: string) => {
  const res = await fetch(`${BASE_URL}/api/reports`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
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
firebaseLogin: async (data: any) => {
  const res = await fetch(`${BASE_URL}/api/auth/firebase-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
},
};
