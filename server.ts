import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES (MOCK DATABASE FOR SCHOOL ERP) --- //

  // Mock Data
  let stats = {
    totalStudents: 12450,
    totalTeachers: 450,
    attendanceRate: 94.5,
    revenue: 1250000,
  };

  let recentActivities = [
    { id: 1, text: "Term 1 Syllabus Updated", time: "2 hours ago", type: "academic" },
    { id: 2, text: "New Admission in Grade 10-A", time: "5 hours ago", type: "admission" },
    { id: 3, text: "Library Book Restock Completed", time: "1 day ago", type: "inventory" },
    { id: 4, text: "Staff Meeting Scheduled for Friday", time: "2 days ago", type: "admin" },
  ];

  let students = [
    { id: 'STU001', name: 'Alex Johnson', grade: '10th', section: 'A', status: 'Active', feeStatus: 'Paid', attendance: '98%' },
    { id: 'STU002', name: 'Maria Garcia', grade: '9th', section: 'B', status: 'Active', feeStatus: 'Pending', attendance: '92%' },
    { id: 'STU003', name: 'James Smith', grade: '11th', section: 'Science', status: 'Active', feeStatus: 'Paid', attendance: '95%' },
    { id: 'STU004', name: 'Linda Martinez', grade: '8th', section: 'C', status: 'Suspended', feeStatus: 'Overdue', attendance: '70%' },
    { id: 'STU005', name: 'Robert Williams', grade: '12th', section: 'Arts', status: 'Active', feeStatus: 'Paid', attendance: '88%' },
  ];

  app.get('/api/dashboard/stats', (req, res) => {
    res.json(stats);
  });

  app.get('/api/dashboard/activities', (req, res) => {
    res.json(recentActivities);
  });

  app.get('/api/students', (req, res) => {
    res.json(students);
  });
  
  app.post('/api/students', (req, res) => {
    const newStudent = { id: `STU00${students.length + 1}`, ...req.body };
    students.push(newStudent);
    res.status(201).json(newStudent);
  });

  // Example Revenue Data for Chart
  app.get('/api/dashboard/revenue-chart', (req, res) => {
    res.json([
      { name: 'Jan', revenue: 400000, expenses: 240000 },
      { name: 'Feb', revenue: 300000, expenses: 139800 },
      { name: 'Mar', revenue: 500000, expenses: 400000 },
      { name: 'Apr', revenue: 478000, expenses: 390800 },
      { name: 'May', revenue: 589000, expenses: 480000 },
      { name: 'Jun', revenue: 439000, expenses: 380000 },
      { name: 'Jul', revenue: 649000, expenses: 430000 },
    ]);
  });

  // Example Attendance Data for Chart
  app.get('/api/dashboard/attendance-chart', (req, res) => {
    res.json([
      { day: 'Mon', rate: 95 },
      { day: 'Tue', rate: 94 },
      { day: 'Wed', rate: 96 },
      { day: 'Thu', rate: 92 },
      { day: 'Fri', rate: 90 },
    ]);
  });


  // --- VITE MIDDLEWARE / SPA FALLBACK --- //
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the dist directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
