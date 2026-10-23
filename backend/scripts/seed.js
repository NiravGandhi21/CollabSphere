/**
 * CollabSphere — Realistic Demonstration Data Seeder
 *
 * Safety & Architecture:
 *  - Connects using backend/config/db.js (reusing Mongoose connection logic).
 *  - Idempotent: Can be executed multiple times without duplicate records or primary key conflicts.
 *  - Scoped to demo data only: Uses @demo.collabsphere.edu domain and isDemo: true flag.
 *  - Hashes passwords using bcrypt with salt rounds 12 (matching application auth standard).
 *  - Never prints passwords, secrets, or raw connection strings to console/logs.
 *  - Preserves any existing real user or project data intact.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Collaboration } from '../models/Collaboration.js';

// Standard demo credentials for all seeded demo student accounts
export const DEMO_PASSWORD = 'DemoStudent@2026!';

// ── 1. Fictional Demo Student Dataset (~16 students across diverse disciplines) ──
const demoStudents = [
  {
    name: 'Nirav Gandhi',
    email: 'nirav.lead@demo.collabsphere.edu',
    department: 'Computer Science & Engineering',
    graduationYear: 2026,
    semester: '6th Semester',
    headline: 'Full-Stack Systems Architect & MERN Specialist',
    bio: 'Passionate about building scalable web applications, distributed systems, and collaborative developer platforms. Core developer and lead maintainer of CollabSphere.',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TailwindCSS', 'Git', 'REST APIs'],
    githubUrl: 'https://github.com/example/nirav-lead',
    linkedinUrl: 'https://linkedin.com/in/example-nirav-lead',
    portfolioUrl: 'https://collabsphere.demo/nirav',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Priya Patel',
    email: 'priya.ui@demo.collabsphere.edu',
    department: 'Information Technology',
    graduationYear: 2026,
    semester: '6th Semester',
    headline: 'Frontend UI/UX Specialist & Creative Technologist',
    bio: 'Specializing in intuitive human-computer interfaces, design systems, and responsive 3D web experiences using Three.js and Figma.',
    skills: ['React', 'UI/UX', 'Figma', 'Three.js', 'CSS3', 'JavaScript', 'Responsive Design'],
    githubUrl: 'https://github.com/example/priya-ui',
    linkedinUrl: 'https://linkedin.com/in/example-priya-ui',
    portfolioUrl: 'https://collabsphere.demo/priya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav.ml@demo.collabsphere.edu',
    department: 'Computer Science & Engineering',
    graduationYear: 2025,
    semester: '8th Semester',
    headline: 'AI/ML Engineer & PyTorch NLP Researcher',
    bio: 'Focusing on NLP pipelines, vector databases, and intelligent search systems. Currently developing syllabus-aligned RAG assistants and predictive academic tools.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'Machine Learning', 'Docker', 'Pandas'],
    githubUrl: 'https://github.com/example/aarav-ml',
    linkedinUrl: 'https://linkedin.com/in/example-aarav-ml',
    portfolioUrl: 'https://collabsphere.demo/aarav',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Ananya Verma',
    email: 'ananya.cloud@demo.collabsphere.edu',
    department: 'Computer Science & Engineering',
    graduationYear: 2026,
    semester: '6th Semester',
    headline: 'Cloud Infrastructure & Resilient Backend Architect',
    bio: 'Dedicated to designing fault-tolerant microservices, high-throughput MongoDB aggregation pipelines, and automated Docker CI/CD deployment workflows.',
    skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'AWS', 'TypeScript', 'REST APIs'],
    githubUrl: 'https://github.com/example/ananya-cloud',
    linkedinUrl: 'https://linkedin.com/in/example-ananya-cloud',
    portfolioUrl: 'https://collabsphere.demo/ananya',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Rohan Joshi',
    email: 'rohan.iot@demo.collabsphere.edu',
    department: 'Mechanical & Mechatronics',
    graduationYear: 2025,
    semester: '8th Semester',
    headline: 'Embedded Systems Prototyper & Robotics Engineer',
    bio: 'Exploring the convergence of physical actuators, computer vision sorting arms, Arduino microcontrollers, and real-time telemetry dashboards.',
    skills: ['C++', 'Python', 'Embedded Systems', 'IoT', 'Arduino', 'Hardware Design', 'Robotics'],
    githubUrl: 'https://github.com/example/rohan-iot',
    linkedinUrl: 'https://linkedin.com/in/example-rohan-iot',
    portfolioUrl: 'https://collabsphere.demo/rohan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Devanshi Shah',
    email: 'devanshi.mobile@demo.collabsphere.edu',
    department: 'Information Technology',
    graduationYear: 2027,
    semester: '4th Semester',
    headline: 'Cross-Platform Mobile Engineer (Flutter & React Native)',
    bio: 'Passionate about fluid micro-animations, offline-first SQLite architectures, and cross-platform native capabilities for university community apps.',
    skills: ['Flutter', 'Dart', 'Firebase', 'Mobile UI', 'REST APIs', 'Git'],
    githubUrl: 'https://github.com/example/devanshi-mobile',
    linkedinUrl: 'https://linkedin.com/in/example-devanshi-mobile',
    portfolioUrl: 'https://collabsphere.demo/devanshi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Kabir Mehta',
    email: 'kabir.vision@demo.collabsphere.edu',
    department: 'Computer Science & Engineering',
    graduationYear: 2026,
    semester: '6th Semester',
    headline: 'Computer Vision Specialist & OpenCV Pipeline Developer',
    bio: 'Building real-time edge facial recognition, object detection for campus robotics, and privacy-preserving biometric verification pipelines.',
    skills: ['Python', 'Computer Vision', 'Machine Learning', 'FastAPI', 'Docker', 'C++'],
    githubUrl: 'https://github.com/example/kabir-vision',
    linkedinUrl: 'https://linkedin.com/in/example-kabir-vision',
    portfolioUrl: 'https://collabsphere.demo/kabir',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Ishita Rao',
    email: 'ishita.data@demo.collabsphere.edu',
    department: 'Information Technology',
    graduationYear: 2026,
    semester: '6th Semester',
    headline: 'Data Science Analyst & Statistical Modeling Specialist',
    bio: 'Transforming messy campus sensor data into clean analytical dashboards with Pandas, SciPy, and automated time-series visualizations.',
    skills: ['Python', 'Pandas', 'SQL', 'Machine Learning', 'Data Visualization', 'FastAPI'],
    githubUrl: 'https://github.com/example/ishita-data',
    linkedinUrl: 'https://linkedin.com/in/example-ishita-data',
    portfolioUrl: 'https://collabsphere.demo/ishita',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Siddharth Roy',
    email: 'siddharth.aero@demo.collabsphere.edu',
    department: 'Mechanical & Mechatronics',
    graduationYear: 2025,
    semester: '8th Semester',
    headline: 'UAV Flight Controller & Autonomous Drone Navigator',
    bio: 'Designing quadcopter flight stabilization firmware, thermal terrain mapping software, and telemetric radio-link ground stations.',
    skills: ['C++', 'Python', 'Embedded Systems', 'Hardware Design', 'IoT', 'Robotics'],
    githubUrl: 'https://github.com/example/siddharth-aero',
    linkedinUrl: 'https://linkedin.com/in/example-siddharth-aero',
    portfolioUrl: 'https://collabsphere.demo/siddharth',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Meera Nambiar',
    email: 'meera.sec@demo.collabsphere.edu',
    department: 'Computer Science & Engineering',
    graduationYear: 2026,
    semester: '6th Semester',
    headline: 'Application Security Auditor & Protocol Specialist',
    bio: 'Dedicated to secure code review, JWT token lifecycle auditing, OAuth2 flows, and zero-knowledge student credential verification.',
    skills: ['Node.js', 'Python', 'REST APIs', 'Git', 'Docker', 'TypeScript'],
    githubUrl: 'https://github.com/example/meera-sec',
    linkedinUrl: 'https://linkedin.com/in/example-meera-sec',
    portfolioUrl: 'https://collabsphere.demo/meera',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Aditya Kulkarni',
    email: 'aditya.dlt@demo.collabsphere.edu',
    department: 'Computer Science & Engineering',
    graduationYear: 2025,
    semester: '8th Semester',
    headline: 'Decentralized Systems & Cryptographic Storage Engineer',
    bio: 'Building tamper-evident digital credential verification networks, decentralized identity solutions, and Merkle tree audit logs for institutions.',
    skills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'REST APIs', 'Docker'],
    githubUrl: 'https://github.com/example/aditya-dlt',
    linkedinUrl: 'https://linkedin.com/in/example-aditya-dlt',
    portfolioUrl: 'https://collabsphere.demo/aditya',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Tara Deshmukh',
    email: 'tara.a11y@demo.collabsphere.edu',
    department: 'Information Technology',
    graduationYear: 2027,
    semester: '4th Semester',
    headline: 'Accessibility Advocate & Universal Design Specialist',
    bio: 'Championing WCAG 2.2 AA compliance, assistive screen-reader navigation, wheelchair campus mapping, and inclusive mobile UI.',
    skills: ['React', 'UI/UX', 'CSS3', 'JavaScript', 'Figma', 'Responsive Design'],
    githubUrl: 'https://github.com/example/tara-a11y',
    linkedinUrl: 'https://linkedin.com/in/example-tara-a11y',
    portfolioUrl: 'https://collabsphere.demo/tara',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Vikram Sengupta',
    email: 'vikram.edge@demo.collabsphere.edu',
    department: 'Mechanical & Mechatronics',
    graduationYear: 2026,
    semester: '6th Semester',
    headline: 'Sensor Fusion & Edge Intelligence Hardware Developer',
    bio: 'Focusing on IMU sensor calibration, Kalman filtering, and low-power microcontroller communications for autonomous agricultural robots.',
    skills: ['C++', 'Python', 'IoT', 'Embedded Systems', 'Machine Learning'],
    githubUrl: 'https://github.com/example/vikram-edge',
    linkedinUrl: 'https://linkedin.com/in/example-vikram-edge',
    portfolioUrl: 'https://collabsphere.demo/vikram',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Rhea Chawla',
    email: 'rhea.health@demo.collabsphere.edu',
    department: 'Information Technology',
    graduationYear: 2026,
    semester: '6th Semester',
    headline: 'Biomedical Signal Analytics & Health Informatics Engineer',
    bio: 'Creating privacy-first mental health logging platforms, pulse plethysmography signal processing, and confidential campus wellness trackers.',
    skills: ['Python', 'Pandas', 'React', 'FastAPI', 'SQL', 'Git'],
    githubUrl: 'https://github.com/example/rhea-health',
    linkedinUrl: 'https://linkedin.com/in/example-rhea-health',
    portfolioUrl: 'https://collabsphere.demo/rhea',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Manish Tripathi',
    email: 'manish.energy@demo.collabsphere.edu',
    department: 'Mechanical & Mechatronics',
    graduationYear: 2025,
    semester: '8th Semester',
    headline: 'Renewable Microgrid Telemetry & Storage Optimizer',
    bio: 'Developing solar inverter telemetry monitors, smart battery pack thermal management, and campus peak-load shedding controllers.',
    skills: ['IoT', 'Arduino', 'Python', 'Data Visualization', 'Embedded Systems'],
    githubUrl: 'https://github.com/example/manish-energy',
    linkedinUrl: 'https://linkedin.com/in/example-manish-energy',
    portfolioUrl: 'https://collabsphere.demo/manish',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
  {
    name: 'Zoya Merchant',
    email: 'zoya.algo@demo.collabsphere.edu',
    department: 'Computer Science & Engineering',
    graduationYear: 2027,
    semester: '4th Semester',
    headline: 'Combinatorial Optimization & High-Performance Computing',
    bio: 'Exploring graph algorithms, multi-threaded task scheduling, and heuristic solvers for campus classroom resource allocation.',
    skills: ['Python', 'C++', 'Machine Learning', 'Git', 'Docker'],
    githubUrl: 'https://github.com/example/zoya-algo',
    linkedinUrl: 'https://linkedin.com/in/example-zoya-algo',
    portfolioUrl: 'https://collabsphere.demo/zoya',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80',
    role: 'student',
    isDemo: true,
  },
];

// ── 2. Fictional Showcase Projects Dataset (10 comprehensive projects) ───────
const demoProjectDefs = [
  {
    title: 'EcoTracker — Carbon Footprint Analytics',
    tagline: 'Empowering university campuses to measure, analyze, and offset daily energy consumption and carbon emissions.',
    description: 'EcoTracker is an institutional sustainability dashboard that aggregates electrical meter metrics across engineering blocks, server rooms, and student hostels. Utilizing IoT edge meters and predictive regression models, the platform forecasts peak consumption hours and provides actionable recommendations to campus facility managers.',
    problemStatement: 'University campuses consume extensive electrical power and generate tons of carbon emissions without transparent departmental accountability. Existing utility bills provide coarse monthly totals rather than granular, actionable data.',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS'],
    githubUrl: 'https://github.com/example/EcoTracker-MERN',
    liveDemoUrl: 'https://ecotracker.demo.collabsphere.edu',
    creatorEmail: 'nirav.lead@demo.collabsphere.edu',
    memberEmails: ['ananya.cloud@demo.collabsphere.edu', 'manish.energy@demo.collabsphere.edu'],
    isAcceptingMembers: true,
    requiredRoles: 'Frontend UI/UX Designer & Data Visualization Specialist',
    category: 'Web Application / Sustainability',
    isDemo: true,
  },
  {
    title: 'CampusNav 3D — Spatial Navigation Portal',
    tagline: 'An interactive 3D digital twin of the university campus for seamless indoor and outdoor wayfinding.',
    description: 'CampusNav 3D allows new students, visiting lecturers, and conference attendees to explore academic blocks, administrative offices, and research labs through an interactive WebGL 3D environment. Includes step-by-step route calculation and wheelchair-accessible paths.',
    problemStatement: 'The university sprawling campus contains multi-story engineering wings and workshop complexes where new students and visitors frequently lose their bearings between adjacent laboratory wings.',
    techStack: ['Three.js', 'React', 'JavaScript', 'CSS3', 'Vite'],
    githubUrl: 'https://github.com/example/CampusNav-3D',
    liveDemoUrl: 'https://campusnav.demo.collabsphere.edu',
    creatorEmail: 'priya.ui@demo.collabsphere.edu',
    memberEmails: ['rohan.iot@demo.collabsphere.edu', 'tara.a11y@demo.collabsphere.edu'],
    isAcceptingMembers: true,
    requiredRoles: 'WebGL Shader Engineer & WebXR Accessibility Tester',
    category: '3D Graphics / Spatial Computing',
    isDemo: true,
  },
  {
    title: 'SmartSyllabus AI — Adaptive Academic Assistant',
    tagline: 'A semantic search engine and syllabus-grounded question-answering assistant for engineering students.',
    description: 'SmartSyllabus AI indexes textbook chapters, university curriculum guidelines, and past exam question papers using vector embeddings. Students can ask conceptual questions in natural language and receive grounded explanations citeable to their exact textbook pages.',
    problemStatement: 'Generic online search engines frequently cite international syllabi and grading frameworks that differ significantly from official departmental engineering curricula.',
    techStack: ['Python', 'FastAPI', 'PyTorch', 'React', 'Docker'],
    githubUrl: 'https://github.com/example/SmartSyllabus-AI',
    liveDemoUrl: 'https://smartsyllabus.demo.collabsphere.edu',
    creatorEmail: 'aarav.ml@demo.collabsphere.edu',
    memberEmails: ['nirav.lead@demo.collabsphere.edu', 'ananya.cloud@demo.collabsphere.edu'],
    isAcceptingMembers: false, // Team full
    requiredRoles: 'None (Core Team Formed)',
    category: 'Artificial Intelligence / EdTech',
    isDemo: true,
  },
  {
    title: 'RoboArm Vision — Kinematic Sorting System',
    tagline: 'Vision-guided robotic arm prototype for automated industrial part sorting and defect detection.',
    description: 'A 4-axis robotic arm integrated with an overhead camera sensor and Raspberry Pi controller. It processes video streams using OpenCV and classifies defective mechanical gears before sorting them into designated recycling bins.',
    problemStatement: 'Manual quality inspection in manufacturing assembly lines is repetitive, error-prone, and hazardous for student operators handling sharp metal remnants.',
    techStack: ['Python', 'C++', 'IoT', 'Arduino', 'Machine Learning'],
    githubUrl: 'https://github.com/example/RoboArm-Vision',
    liveDemoUrl: 'https://roboarm.demo.collabsphere.edu',
    creatorEmail: 'rohan.iot@demo.collabsphere.edu',
    memberEmails: ['kabir.vision@demo.collabsphere.edu', 'vikram.edge@demo.collabsphere.edu'],
    isAcceptingMembers: true,
    requiredRoles: 'Computer Vision Specialist & Firmware Tester',
    category: 'Robotics / IoT',
    isDemo: true,
  },
  {
    title: 'UniEvents Mobile — Campus Pulse & Ticketing',
    tagline: 'Centralized event discovery, digital pass generation, and hackathon registration for campus clubs.',
    description: 'UniEvents consolidates hackathons, cultural festivals, tech symposia, and workshop registrations across all university departments into a unified mobile application with QR-based digital ticketing and push notifications.',
    problemStatement: 'Student clubs rely on disparate Google Forms and Instagram posters, resulting in missed deadlines, duplicate registrations, and manual attendance tracking.',
    techStack: ['Flutter', 'Dart', 'Firebase', 'Node.js', 'REST APIs'],
    githubUrl: 'https://github.com/example/UniEvents-Mobile',
    liveDemoUrl: 'https://unievents.demo.collabsphere.edu',
    creatorEmail: 'devanshi.mobile@demo.collabsphere.edu',
    memberEmails: ['priya.ui@demo.collabsphere.edu'],
    isAcceptingMembers: true,
    requiredRoles: 'Backend API Architect & Payment Gateway Tester',
    category: 'Mobile Application / Campus Life',
    isDemo: true,
  },
  {
    title: 'VisionAttend — Biometric Classroom Attendance',
    tagline: 'Edge AI facial recognition portal for contactless, fast attendance tracking during university lectures.',
    description: 'VisionAttend leverages multi-task cascaded convolutional networks (MTCNN) running on an edge Jetson Nano to log student attendance in lecture halls within 30 seconds of entry, respecting privacy by storing local embeddings rather than raw facial imagery.',
    problemStatement: 'Calling paper roll rolls consumes 10-15 minutes of an instructional hour and paper sign-in sheets suffer from rampant proxy signing.',
    techStack: ['Python', 'Machine Learning', 'FastAPI', 'Docker', 'React'],
    githubUrl: 'https://github.com/example/VisionAttend',
    liveDemoUrl: 'https://visionattend.demo.collabsphere.edu',
    creatorEmail: 'kabir.vision@demo.collabsphere.edu',
    memberEmails: ['ishita.data@demo.collabsphere.edu'],
    isAcceptingMembers: true,
    requiredRoles: 'Edge Hardware Integrator & Privacy Officer',
    category: 'Computer Vision / Campus Automation',
    isDemo: true,
  },
  {
    title: 'AeroSurvey — Autonomous Thermal Mapping Drone',
    tagline: 'Autonomous UAV quadcopter system for rooftop solar inspection and building insulation thermal auditing.',
    description: 'A custom carbon-fiber quadcopter equipped with radiometric thermal cameras and autonomous waypoint navigation. The craft captures orthomosaic thermal maps of university buildings to detect heat loss and damaged photovoltaic cells.',
    problemStatement: 'Manual inspection of elevated solar installations across multi-story academic buildings requires hazardous ladder climbing and provides only spot measurements.',
    techStack: ['C++', 'Python', 'Embedded Systems', 'IoT'],
    githubUrl: 'https://github.com/example/AeroSurvey',
    liveDemoUrl: 'https://aerosurvey.demo.collabsphere.edu',
    creatorEmail: 'siddharth.aero@demo.collabsphere.edu',
    memberEmails: ['vikram.edge@demo.collabsphere.edu'],
    isAcceptingMembers: true,
    requiredRoles: 'Ground Control Station UI Developer & Telemetry Analyst',
    category: 'Aerospace / Robotics',
    isDemo: true,
  },
  {
    title: 'PulseSync — Student Mental Well-being Journal',
    tagline: 'Encrypted, privacy-preserving mood tracking and mental health wellness journaling platform for students.',
    description: 'PulseSync offers student engineers a safe, zero-knowledge encrypted digital space to track academic burnout, log stress metrics, and receive CBT-inspired breathing exercises and on-campus counseling appointment booking.',
    problemStatement: 'Academic pressure during midterms causes severe stress, yet students avoid campus counseling services due to stigma and fear of record exposure.',
    techStack: ['React', 'Node.js', 'MongoDB', 'Express', 'UI/UX'],
    githubUrl: 'https://github.com/example/PulseSync',
    liveDemoUrl: 'https://pulsesync.demo.collabsphere.edu',
    creatorEmail: 'rhea.health@demo.collabsphere.edu',
    memberEmails: ['tara.a11y@demo.collabsphere.edu', 'zoya.algo@demo.collabsphere.edu'],
    isAcceptingMembers: true,
    requiredRoles: 'End-to-End Encryption Engineer & Mobile Developer',
    category: 'HealthTech / EdTech',
    isDemo: true,
  },
  {
    title: 'AccessPath — Wheelchair Route & Ramp Mapper',
    tagline: 'Crowdsourced accessibility mapping for campus ramps, elevators, and tactile pedestrian pathways.',
    description: 'An open-source progressive web app that visualizes sidewalk slopes, automatic door statuses, and elevator maintenance schedules across all campus blocks to calculate obstacle-free travel routes for wheelchair users.',
    problemStatement: 'Campus construction and unexpected elevator maintenance often isolate physically challenged students without advance warning or viable alternate routing.',
    techStack: ['React', 'JavaScript', 'TailwindCSS', 'REST APIs'],
    githubUrl: 'https://github.com/example/AccessPath',
    liveDemoUrl: 'https://accesspath.demo.collabsphere.edu',
    creatorEmail: 'tara.a11y@demo.collabsphere.edu',
    memberEmails: ['priya.ui@demo.collabsphere.edu'],
    isAcceptingMembers: true,
    requiredRoles: 'Crowdsourced Geodata Reviewer & GPS Tester',
    category: 'Accessibility / Civic Tech',
    isDemo: true,
  },
  {
    title: 'ChainDegree — Tamper-Proof Academic Credentialing',
    tagline: 'Cryptographically signed digital diplomas and verifiable micro-credential records for graduates.',
    description: 'ChainDegree issues W3C Verifiable Credentials for university course completions and capstone honors. Employers can verify a student academic record in seconds by scanning a QR code against a cryptographic hash registry.',
    problemStatement: 'Paper transcripts take weeks to request from university registrars and paper document fraud remains a persistent vulnerability in hiring.',
    techStack: ['TypeScript', 'Node.js', 'React', 'Docker', 'REST APIs'],
    githubUrl: 'https://github.com/example/ChainDegree',
    liveDemoUrl: 'https://chaindegree.demo.collabsphere.edu',
    creatorEmail: 'aditya.dlt@demo.collabsphere.edu',
    memberEmails: ['meera.sec@demo.collabsphere.edu'],
    isAcceptingMembers: false, // Completed
    requiredRoles: 'Security Auditor & Zero-Knowledge Proof Researcher',
    category: 'Decentralized Systems / Security',
    isDemo: true,
  },
];

// ── 3. Fictional Collaboration Join Requests Dataset (20 requests) ───────────
const demoCollabDefs = [
  // EcoTracker (Lead: Nirav Gandhi)
  {
    projectTitle: 'EcoTracker — Carbon Footprint Analytics',
    applicantEmail: 'priya.ui@demo.collabsphere.edu',
    pitchMessage: "Hi Nirav, I saw EcoTracker and loved the sustainability initiative! I have deep experience building sleek dashboards with Chart.js and Figma, and I'd love to lead the frontend redesign.",
    status: 'Pending',
  },
  {
    projectTitle: 'EcoTracker — Carbon Footprint Analytics',
    applicantEmail: 'aarav.ml@demo.collabsphere.edu',
    pitchMessage: 'Hey Nirav, I can integrate time-series forecasting models using PyTorch to predict peak campus energy usage 24 hours in advance.',
    status: 'Pending',
  },
  {
    projectTitle: 'EcoTracker — Carbon Footprint Analytics',
    applicantEmail: 'ananya.cloud@demo.collabsphere.edu',
    pitchMessage: 'I can build the automated Docker deployment and Redis caching layer to make the database queries lightning fast.',
    status: 'Accepted',
  },
  {
    projectTitle: 'EcoTracker — Carbon Footprint Analytics',
    applicantEmail: 'manish.energy@demo.collabsphere.edu',
    pitchMessage: 'I have calibrated hardware current sensors installed across hostel blocks and can pipe live telemetry into EcoTracker.',
    status: 'Accepted',
  },
  {
    projectTitle: 'EcoTracker — Carbon Footprint Analytics',
    applicantEmail: 'kabir.vision@demo.collabsphere.edu',
    pitchMessage: 'Could we integrate thermal camera feeds to count people in rooms and estimate cooling requirements?',
    status: 'Declined',
  },

  // CampusNav 3D (Lead: Priya Patel)
  {
    projectTitle: 'CampusNav 3D — Spatial Navigation Portal',
    applicantEmail: 'rohan.iot@demo.collabsphere.edu',
    pitchMessage: 'I have calibrated indoor WiFi beacon telemetry that can feed live location coordinates into your 3D campus coordinate space.',
    status: 'Accepted',
  },
  {
    projectTitle: 'CampusNav 3D — Spatial Navigation Portal',
    applicantEmail: 'tara.a11y@demo.collabsphere.edu',
    pitchMessage: 'I would love to help map every handicap ramp and elevator so CampusNav can calculate fully accessible routes.',
    status: 'Accepted',
  },
  {
    projectTitle: 'CampusNav 3D — Spatial Navigation Portal',
    applicantEmail: 'devanshi.mobile@demo.collabsphere.edu',
    pitchMessage: 'I would like to help build the web view wrapper for Android and iOS devices so students can use CampusNav natively on mobile.',
    status: 'Pending',
  },
  {
    projectTitle: 'CampusNav 3D — Spatial Navigation Portal',
    applicantEmail: 'nirav.lead@demo.collabsphere.edu',
    pitchMessage: 'I can build an optimized REST API to fetch landmark nodes and floor plan geometry dynamically instead of loading a massive static bundle.',
    status: 'Pending',
  },

  // SmartSyllabus AI (Lead: Aarav Sharma - isAcceptingMembers: false)
  {
    projectTitle: 'SmartSyllabus AI — Adaptive Academic Assistant',
    applicantEmail: 'nirav.lead@demo.collabsphere.edu',
    pitchMessage: 'I helped architect the vector search indexing pipeline and React frontend interface during early prototyping.',
    status: 'Accepted',
  },
  {
    projectTitle: 'SmartSyllabus AI — Adaptive Academic Assistant',
    applicantEmail: 'ananya.cloud@demo.collabsphere.edu',
    pitchMessage: 'I provisioned the Docker container environment and PostgreSQL vector storage extension for the embeddings.',
    status: 'Accepted',
  },
  {
    projectTitle: 'SmartSyllabus AI — Adaptive Academic Assistant',
    applicantEmail: 'zoya.algo@demo.collabsphere.edu',
    pitchMessage: 'I can implement approximate nearest neighbor graph search algorithms to speed up semantic document retrieval.',
    status: 'Declined',
  },

  // RoboArm Vision (Lead: Rohan Joshi)
  {
    projectTitle: 'RoboArm Vision — Kinematic Sorting System',
    applicantEmail: 'kabir.vision@demo.collabsphere.edu',
    pitchMessage: 'I can train custom YOLOv8 models to classify defective gear teeth from the overhead camera in real time.',
    status: 'Accepted',
  },
  {
    projectTitle: 'RoboArm Vision — Kinematic Sorting System',
    applicantEmail: 'vikram.edge@demo.collabsphere.edu',
    pitchMessage: 'I have low-latency stepper motor controller firmware ready for the 4-axis arm kinematics.',
    status: 'Accepted',
  },
  {
    projectTitle: 'RoboArm Vision — Kinematic Sorting System',
    applicantEmail: 'nirav.lead@demo.collabsphere.edu',
    pitchMessage: 'I can design the telemetry web dashboard with real-time WebSockets and MongoDB logging for every item sorted by the arm.',
    status: 'Pending',
  },

  // UniEvents Mobile (Lead: Devanshi Shah)
  {
    projectTitle: 'UniEvents Mobile — Campus Pulse & Ticketing',
    applicantEmail: 'priya.ui@demo.collabsphere.edu',
    pitchMessage: 'I can design the complete mobile Figma UI kit, dark mode event passes, and animated ticket confirmation screen.',
    status: 'Accepted',
  },
  {
    projectTitle: 'UniEvents Mobile — Campus Pulse & Ticketing',
    applicantEmail: 'meera.sec@demo.collabsphere.edu',
    pitchMessage: 'I want to help implement QR code cryptographic signing so event tickets cannot be forged or duplicated.',
    status: 'Pending',
  },

  // VisionAttend (Lead: Kabir Mehta)
  {
    projectTitle: 'VisionAttend — Biometric Classroom Attendance',
    applicantEmail: 'ishita.data@demo.collabsphere.edu',
    pitchMessage: 'I can write data aggregation queries to output weekly departmental attendance reports for professors automatically.',
    status: 'Accepted',
  },
  {
    projectTitle: 'VisionAttend — Biometric Classroom Attendance',
    applicantEmail: 'nirav.lead@demo.collabsphere.edu',
    pitchMessage: 'I can build the Express backend endpoints to securely ingest attendance logs and handle role-based faculty access.',
    status: 'Pending',
  },

  // PulseSync (Lead: Rhea Chawla)
  {
    projectTitle: 'PulseSync — Student Mental Well-being Journal',
    applicantEmail: 'tara.a11y@demo.collabsphere.edu',
    pitchMessage: 'I can ensure the emotional journaling interface is calm, high-contrast, accessible, and supports screen readers.',
    status: 'Accepted',
  },
];

// ── 4. Main Idempotent Seeder Function ────────────────────────────────────────
export async function seedDemoData() {
  console.log('🚀 Starting CollabSphere Demo Data Seeding...');

  // Connect to DB
  await connectDB();

  const dbName = mongoose.connection.name;
  console.log(`📍 Connected target database: "${dbName}"`);

  // Safety check: Prevent seeding if database looks like an unverified external prod cluster
  if (dbName === 'production' || dbName === 'collabsphere_prod') {
    throw new Error('🛑 Safety Halt: Seeding is strictly blocked on production database names.');
  }

  // ── Step 1: Upsert Demo Students ──────────────────────────────────────────
  console.log(`\n👤 Seeding ${demoStudents.length} demo student profiles...`);
  const userMap = new Map(); // email -> User document
  let createdUsers = 0;
  let updatedUsers = 0;

  for (const s of demoStudents) {
    const existing = await User.findOne({ email: s.email });
    if (existing) {
      // Update fields to keep demo dataset synchronized without changing ID
      Object.assign(existing, s);
      existing.passwordHash = DEMO_PASSWORD; // Pre-save hook will hash this once
      await existing.save();
      userMap.set(s.email, existing);
      updatedUsers++;
    } else {
      const newUser = new User({
        ...s,
        passwordHash: DEMO_PASSWORD, // Pre-save hook will hash this once
      });
      await newUser.save();
      userMap.set(s.email, newUser);
      createdUsers++;
    }
  }
  console.log(`   ✅ Users: ${createdUsers} created, ${updatedUsers} refreshed.`);

  // ── Step 2: Upsert Demo Projects ──────────────────────────────────────────
  console.log(`\n📁 Seeding ${demoProjectDefs.length} showcase projects...`);
  const projectMap = new Map(); // title -> Project document
  let createdProjects = 0;
  let updatedProjects = 0;

  for (const p of demoProjectDefs) {
    const creator = userMap.get(p.creatorEmail);
    if (!creator) {
      console.warn(`⚠️ Creator not found for project: ${p.title} (${p.creatorEmail})`);
      continue;
    }

    const memberIds = (p.memberEmails || [])
      .map((mEmail) => userMap.get(mEmail)?._id)
      .filter(Boolean)
      .filter((id) => id.toString() !== creator._id.toString()); // Ensure creator not in memberIds

    const projectPayload = {
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      problemStatement: p.problemStatement,
      techStack: p.techStack,
      githubUrl: p.githubUrl,
      liveDemoUrl: p.liveDemoUrl,
      isAcceptingMembers: p.isAcceptingMembers,
      requiredRoles: p.requiredRoles,
      category: p.category,
      creatorId: creator._id,
      memberIds,
      isDemo: true,
    };

    const existing = await Project.findOne({ title: p.title });
    if (existing) {
      Object.assign(existing, projectPayload);
      await existing.save();
      projectMap.set(p.title, existing);
      updatedProjects++;
    } else {
      const newProj = new Project(projectPayload);
      await newProj.save();
      projectMap.set(p.title, newProj);
      createdProjects++;
    }
  }
  console.log(`   ✅ Projects: ${createdProjects} created, ${updatedProjects} refreshed.`);

  // ── Step 3: Upsert Demo Collaborations ────────────────────────────────────
  console.log(`\n🤝 Seeding ${demoCollabDefs.length} collaboration join requests...`);
  let createdCollabs = 0;
  let updatedCollabs = 0;

  for (const c of demoCollabDefs) {
    const project = projectMap.get(c.projectTitle);
    const applicant = userMap.get(c.applicantEmail);

    if (!project || !applicant) {
      console.warn(`⚠️ Project or applicant not found for collab: ${c.projectTitle} -> ${c.applicantEmail}`);
      continue;
    }

    // Safety rule: Creator cannot apply to own project
    if (project.creatorId.toString() === applicant._id.toString()) {
      continue;
    }

    const existing = await Collaboration.findOne({
      projectId: project._id,
      applicantId: applicant._id,
      status: c.status,
    });

    if (existing) {
      existing.pitchMessage = c.pitchMessage;
      await existing.save();
      updatedCollabs++;
    } else {
      // Check partial unique index: If status is Pending, verify no pending already exists
      if (c.status === 'Pending') {
        const pendingExisting = await Collaboration.findOne({
          projectId: project._id,
          applicantId: applicant._id,
          status: 'Pending',
        });
        if (pendingExisting) {
          pendingExisting.pitchMessage = c.pitchMessage;
          await pendingExisting.save();
          updatedCollabs++;
          continue;
        }
      }

      const newCollab = new Collaboration({
        projectId: project._id,
        applicantId: applicant._id,
        pitchMessage: c.pitchMessage,
        status: c.status,
        isDemo: true,
      });
      await newCollab.save();
      createdCollabs++;
    }
  }
  console.log(`   ✅ Collaborations: ${createdCollabs} created, ${updatedCollabs} refreshed.`);

  console.log('\n🎉 Demonstration data successfully seeded into database!');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('🔑 Safe Demo Login Credentials for All Seeded Students:');
  console.log('   Email Format : <name>.<role>@demo.collabsphere.edu');
  console.log(`   Standard Pass: ${DEMO_PASSWORD}`);
  console.log('   Featured Lead: nirav.lead@demo.collabsphere.edu');
  console.log('   Applicant UI : priya.ui@demo.collabsphere.edu');
  console.log('   AI Student   : aarav.ml@demo.collabsphere.edu');
  console.log('─────────────────────────────────────────────────────────────────');

  return {
    users: { created: createdUsers, updated: updatedUsers, total: demoStudents.length },
    projects: { created: createdProjects, updated: updatedProjects, total: demoProjectDefs.length },
    collaborations: { created: createdCollabs, updated: updatedCollabs, total: demoCollabDefs.length },
  };
}

// Direct CLI invocation
if (process.argv[1]?.endsWith('seed.js')) {
  seedDemoData()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding Error:', err.message);
      await disconnectDB();
      process.exit(1);
    });
}
