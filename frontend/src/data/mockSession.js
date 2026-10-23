/**
 * Development and demonstration personas for role and permission simulation.
 * Maps to seeded database accounts in MongoDB Atlas for live full-stack demo.
 */

export const DEMO_PASSWORD = 'DemoStudent@2026!';

export const mockPersonas = [
  {
    key: "lead",
    label: "Project Lead (Nirav)",
    userId: "usr_01",
    email: "nirav.lead@demo.collabsphere.edu",
    description: "Creator of EcoTracker with pending collaboration requests in inbox"
  },
  {
    key: "member",
    label: "Student Member (Priya)",
    userId: "usr_02",
    email: "priya.ui@demo.collabsphere.edu",
    description: "Applicant with submitted requests and creator of CampusNav 3D"
  },
  {
    key: "ai_student",
    label: "Student (Aarav)",
    userId: "usr_03",
    email: "aarav.ml@demo.collabsphere.edu",
    description: "Active collaborator with AI/ML capstone projects"
  },
  {
    key: "guest",
    label: "Guest (Visitor)",
    userId: null,
    email: null,
    description: "Unauthenticated visitor with public read-only browsing"
  }
];
