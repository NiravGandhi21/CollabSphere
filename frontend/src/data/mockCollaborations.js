/**
 * Fictional collaboration join requests matching CollabSphere requirements.
 * Used for development-time simulation of CollaborationRequest collection.
 */

export const mockCollaborations = [
  {
    id: "collab_01",
    projectId: "proj_01", // EcoTracker (Creator: Nirav Gandhi)
    applicantId: "usr_02", // Priya Patel
    pitchMessage: "Hi Nirav, I saw EcoTracker and loved the sustainability initiative! I have deep experience building sleek dashboards with Chart.js and Figma, and I'd love to lead the frontend redesign.",
    status: "Pending",
    createdAt: "2025-02-10T10:15:00Z"
  },
  {
    id: "collab_02",
    projectId: "proj_01", // EcoTracker (Creator: Nirav Gandhi)
    applicantId: "usr_03", // Aarav Sharma
    pitchMessage: "Hey Nirav, I can integrate time-series forecasting models using PyTorch to predict peak campus energy usage 24 hours in advance.",
    status: "Pending",
    createdAt: "2025-02-11T14:40:00Z"
  },
  {
    id: "collab_03",
    projectId: "proj_01", // EcoTracker (Creator: Nirav Gandhi)
    applicantId: "usr_04", // Ananya Verma
    pitchMessage: "I can build the automated Docker deployment and Redis caching layer to make the database queries lightning fast.",
    status: "Accepted",
    createdAt: "2024-11-20T09:00:00Z"
  },
  {
    id: "collab_04",
    projectId: "proj_02", // CampusNav 3D (Creator: Priya Patel)
    applicantId: "usr_05", // Rohan Joshi
    pitchMessage: "I have calibrated indoor WiFi beacon telemetry that can feed live location coordinates into your 3D campus coordinate space.",
    status: "Accepted",
    createdAt: "2024-12-05T12:00:00Z"
  },
  {
    id: "collab_05",
    projectId: "proj_02", // CampusNav 3D (Creator: Priya Patel)
    applicantId: "usr_06", // Devanshi Shah
    pitchMessage: "I'd like to help build the web view wrapper for Android and iOS devices so students can use CampusNav natively on mobile.",
    status: "Pending",
    createdAt: "2025-02-12T16:20:00Z"
  },
  {
    id: "collab_06",
    projectId: "proj_04", // RoboArm Vision (Creator: Rohan Joshi)
    applicantId: "usr_01", // Nirav Gandhi
    pitchMessage: "I can design the telemetry web dashboard with real-time WebSockets and MongoDB logging for every item sorted by the arm.",
    status: "Pending",
    createdAt: "2025-02-13T11:00:00Z"
  }
];
