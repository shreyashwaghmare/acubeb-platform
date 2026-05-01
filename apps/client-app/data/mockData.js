export const client = {
  name: "XYZ Developers",
  mobile: "9881967899",
  email: "client@example.com",
  gst: "27ABCDE1234F1Z5",
  address: "Mumbai, Maharashtra",
};

export const requests = [
  {
    id: "1",
    requestNo: "ACB-REQ-0001",
    service: "Cube Testing",
    project: "ABC Tower",
    site: "Andheri, Mumbai",
    status: "Testing in Progress",
    date: "30 Apr 2026",
    timeline: ["Request Submitted", "Operator Assigned", "Sample Collected", "Testing in Progress"],
  },
  {
    id: "2",
    requestNo: "ACB-REQ-0002",
    service: "Rebound Hammer Test",
    project: "Skyline Residency",
    site: "Bandra, Mumbai",
    status: "Report Ready",
    date: "29 Apr 2026",
    timeline: ["Request Submitted", "Site Visit Done", "Report Ready"],
  },
];

export const services = [
  "Cube Testing",
  "Steel Testing",
  "Soil Testing",
  "Rebound Hammer Test",
  "UPV Test",
  "Structural Audit",
  "Stability Certificate",
  "Water Testing",
];
export const serviceCategories = [
  "Material Testing",
  "NDT Testing",
  "Structural Consultancy",
  "Stability Certificate",
];

export const requestStatuses = [
  "New Request",
  "Admin Review",
  "Operator Assigned",
  "Sample Collected",
  "Testing in Progress",
  "Report Ready",
];
export const reports = [
  {
    id: "1",
    reportNo: "ACB/R/2026/001",
    service: "Cube Testing",
    project: "ABC Tower",
    client: "XYZ Developers",
    issueDate: "30 Apr 2026",
    status: "Valid",
    verifiedBy: "A Cube B Consultants Pvt Ltd",
    verificationCode: "ACB-VERIFY-0001",
  },
];