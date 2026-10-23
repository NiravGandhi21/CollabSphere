/**
 * Fictional project showcase records matching CollabSphere requirements.
 * Used for development-time simulation of Project collection.
 */

export const mockProjects = [
  {
    id: "proj_01",
    title: "EcoTracker — Carbon Footprint Analytics",
    tagline: "Empowering university campuses to measure, analyze, and offset daily energy consumption and carbon emissions.",
    description: "EcoTracker is an institutional sustainability dashboard that aggregates energy metrics across university academic blocks, laboratories, and student hostels. Utilizing IoT edge meters and predictive regression models, the platform forecasts peak consumption hours and provides actionable recommendations to campus facility managers.",
    problemStatement: "University campuses consume significant electricity and produce tons of waste without transparent, real-time departmental accountability. Existing utility bills provide aggregated monthly totals rather than granular, actionable data.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "TailwindCSS", "Chart.js"],
    githubUrl: "https://github.com/NiravGandhi21/EcoTracker-MERN",
    liveDemoUrl: "https://ecotracker-demo.vercel.app",
    creatorId: "usr_01", // Nirav Gandhi
    memberIds: ["usr_04"], // Ananya Verma
    isAcceptingMembers: true,
    requiredRoles: "Frontend UI/UX Designer & Data Visualization Specialist",
    category: "Web Application / Sustainability",
    createdAt: "2024-11-15T10:00:00Z"
  },
  {
    id: "proj_02",
    title: "CampusNav 3D — Spatial Navigation Portal",
    tagline: "An interactive 3D digital twin of the ITM SLS Baroda University campus for indoor and outdoor wayfinding.",
    description: "CampusNav 3D allows first-year students, visiting parents, and conference attendees to explore lecture halls, administrative offices, and research labs through an interactive WebGL 3D environment. Includes step-by-step route calculation and accessibility paths for physically challenged individuals.",
    problemStatement: "The university sprawling 40-acre campus contains multi-story engineering wings and workshop complexes where new students and guests frequently lose their way between adjacent lecture halls.",
    techStack: ["Three.js", "React", "JavaScript", "CSS3", "Vite", "Blender"],
    githubUrl: "https://github.com/priyapatel-dev/CampusNav-3D",
    liveDemoUrl: "https://campusnav-3d.web.app",
    creatorId: "usr_02", // Priya Patel
    memberIds: ["usr_05"], // Rohan Joshi
    isAcceptingMembers: true,
    requiredRoles: "WebGL Shader Engineer & WebXR Tester",
    category: "3D Graphics / Spatial Computing",
    createdAt: "2024-12-01T14:30:00Z"
  },
  {
    id: "proj_03",
    title: "SmartSyllabus AI — Adaptive Academic Assistant",
    tagline: "A semantic search engine and syllabus-aligned question-answering assistant for engineering students.",
    description: "SmartSyllabus AI indexes textbook chapters, university curriculum syllabi, and past exam question papers using vector embeddings. Students can ask conceptual questions in natural language and receive grounded explanations citeable to their exact textbook pages.",
    problemStatement: "Generic LLMs often hallucinate or cite international syllabi that differ significantly from specific university exam standards and grading schemes.",
    techStack: ["Python", "FastAPI", "PyTorch", "React", "Docker", "PostgreSQL"],
    githubUrl: "https://github.com/aaravsharma-ai/SmartSyllabus-AI",
    liveDemoUrl: "https://smartsyllabus.ai-demo.org",
    creatorId: "usr_03", // Aarav Sharma
    memberIds: ["usr_01", "usr_04"], // Nirav Gandhi, Ananya Verma
    isAcceptingMembers: false, // Team full
    requiredRoles: "None (Core Team Formed)",
    category: "Artificial Intelligence / EdTech",
    createdAt: "2025-01-10T09:15:00Z"
  },
  {
    id: "proj_04",
    title: "RoboArm Vision — Kinematic Sorting System",
    tagline: "Vision-guided robotic arm prototype for automated industrial part sorting and defect detection.",
    description: "A 4-axis robotic arm integrated with an overhead camera sensor and Raspberry Pi controller. It processes video streams using OpenCV and classifies defective mechanical gears before sorting them into designated recycling bins.",
    problemStatement: "Manual quality inspection in manufacturing assembly lines is repetitive, error-prone, and hazardous for workers handling sharp metal remnants.",
    techStack: ["Python", "C++", "IoT", "Arduino", "Machine Learning", "Embedded Systems"],
    githubUrl: "https://github.com/rohan-joshi-iot/RoboArm-Vision",
    liveDemoUrl: "",
    creatorId: "usr_05", // Rohan Joshi
    memberIds: [],
    isAcceptingMembers: true,
    requiredRoles: "Computer Vision Specialist & Firmware Tester",
    category: "Robotics / IoT",
    createdAt: "2025-01-28T16:45:00Z"
  },
  {
    id: "proj_05",
    title: "UniEvents Mobile — Campus Pulse & Ticketing",
    tagline: "Centralized event discovery, digital pass generation, and hackathon registration for campus clubs.",
    description: "UniEvents consolidates hackathons, cultural festivals, tech symposia, and workshop registrations across all ITM BU departments into a unified mobile application with QR-based digital ticketing and push notifications.",
    problemStatement: "Student clubs rely on disparate Google Forms and Instagram posters, resulting in missed deadlines, duplicate registrations, and manual attendance tracking.",
    techStack: ["Flutter", "Dart", "Firebase", "Node.js", "Express", "REST APIs"],
    githubUrl: "https://github.com/devanshi-shah/UniEvents-Mobile",
    liveDemoUrl: "https://unievents.app.run",
    creatorId: "usr_06", // Devanshi Shah
    memberIds: ["usr_02"], // Priya Patel
    isAcceptingMembers: true,
    requiredRoles: "Backend API Architect & Payment Gateway Tester",
    category: "Mobile Application / Campus Life",
    createdAt: "2025-02-05T11:20:00Z"
  }
];
