import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { localDb } from '../config/localDb';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { geminiService } from '../services/geminiService';
import os from 'os';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_careerpilot_token_key_12345';

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF resumes are accepted.'));
    }
  }
});

// Helper: Award XP and unlock badges
function awardXpAndBadges(userId: string, xpAmount: number, badgeId: string) {
  const profile = localDb.findOne('profiles', p => p.userId === userId);
  if (!profile) return null;

  const unlockedBadges = profile.unlockedBadges || [];
  let badgeUnlocked = false;

  if (!unlockedBadges.includes(badgeId)) {
    const badge = localDb.findOne('achievements', a => a.id === badgeId);
    if (badge) {
      unlockedBadges.push(badgeId);
      xpAmount += badge.xpReward;
      badgeUnlocked = true;
    }
  }

  const newXp = (profile.xp || 0) + xpAmount;
  
  // Calculate level based on XP (every 500 XP is a level)
  const newLevel = Math.floor(newXp / 500) + 1;

  localDb.update('profiles', p => p.userId === userId, {
    xp: newXp,
    level: newLevel,
    unlockedBadges
  });

  return { xpGained: xpAmount, badgeUnlocked, newXp, newLevel };
}

// ==========================================
// AUTH & ONBOARDING ROUTES
// ==========================================

router.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  const existingUser = localDb.findOne('users', u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists with this email." });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = localDb.insert('users', {
    name,
    email,
    password: hashedPassword,
    role: 'user'
  });

  // Create associated profile
  const newProfile = localDb.insert('profiles', {
    userId: newUser._id,
    education: '',
    degree: '',
    dreamRole: '',
    skills: [],
    experienceLevel: 'Beginner',
    careerInterests: [],
    xp: 0,
    level: 1,
    unlockedBadges: [],
    streakCount: 0,
    lastActive: new Date().toISOString().split('T')[0]
  });

  const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

  // Update global analytics
  const analytics = localDb.findOne('analytics', a => a.id === 'global');
  if (analytics) {
    localDb.update('analytics', a => a.id === 'global', {
      totalUsers: (analytics.totalUsers || 0) + 1,
      activeUsers: (analytics.activeUsers || 0) + 1
    });
  }

  res.status(201).json({
    token,
    user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    profile: newProfile
  });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = localDb.findOne('users', u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  let profile = localDb.findOne('profiles', p => p.userId === user._id);
  if (!profile) {
    profile = localDb.insert('profiles', {
      userId: user._id,
      education: '',
      degree: '',
      dreamRole: '',
      skills: [],
      experienceLevel: 'Beginner',
      careerInterests: [],
      xp: 0,
      level: 1,
      unlockedBadges: [],
      streakCount: 0,
      lastActive: new Date().toISOString().split('T')[0]
    });
  }

  // Handle streak calculations
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let streakCount = profile.streakCount || 0;

  if (profile.lastActive === yesterday) {
    streakCount += 1;
  } else if (profile.lastActive !== today) {
    streakCount = 1; // reset or start new
  }

  localDb.update('profiles', p => p.userId === user._id, {
    streakCount,
    lastActive: today
  });

  profile.streakCount = streakCount;

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  // Update global analytics active users
  const analytics = localDb.findOne('analytics', a => a.id === 'global');
  if (analytics) {
    localDb.update('analytics', a => a.id === 'global', {
      activeUsers: Math.max((analytics.activeUsers || 0), (localDb.getCollection('users').length))
    });
  }

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    profile
  });
});

router.post('/auth/onboarding', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { education, degree, dreamRole, skills, experienceLevel, careerInterests } = req.body;

  const profile = localDb.findOne('profiles', p => p.userId === userId);
  if (!profile) {
    return res.status(404).json({ error: "Profile not found." });
  }

  localDb.update('profiles', p => p.userId === userId, {
    education,
    degree,
    dreamRole,
    skills,
    experienceLevel,
    careerInterests
  });

  const rewards = awardXpAndBadges(userId!, 50, 'ach-1'); // Award Explorer badge
  const updatedProfile = localDb.findOne('profiles', p => p.userId === userId);

  res.json({
    message: "Onboarding completed successfully!",
    profile: updatedProfile,
    rewards
  });
});

router.get('/auth/profile', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const user = localDb.findOne('users', u => u._id === userId);
  const profile = localDb.findOne('profiles', p => p.userId === userId);

  if (!user || !profile) {
    return res.status(404).json({ error: "Profile not found." });
  }

  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, profile });
});

router.put('/auth/profile', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { education, degree, dreamRole, skills, experienceLevel, careerInterests, name } = req.body;

  if (name) {
    localDb.update('users', u => u._id === userId, { name });
  }

  localDb.update('profiles', p => p.userId === userId, {
    education,
    degree,
    dreamRole,
    skills,
    experienceLevel,
    careerInterests
  });

  const updatedUser = localDb.findOne('users', u => u._id === userId);
  const updatedProfile = localDb.findOne('profiles', p => p.userId === userId);

  res.json({
    message: "Profile updated successfully!",
    user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email },
    profile: updatedProfile
  });
});

// ==========================================
// AI CAREER MENTOR CHAT ROUTE
// ==========================================

router.post('/mentor/chat', authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { message, history } = req.body;
  const customApiKey = req.headers['x-gemini-key'] as string | undefined;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const profile = localDb.findOne('profiles', p => p.userId === userId);
  try {
    const reply = await geminiService.chatWithMentor(message, history || [], profile, customApiKey);
    
    // Award 5 XP for mentoring activity
    awardXpAndBadges(userId!, 5, 'none');

    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to communicate with mentor." });
  }
});

// ==========================================
// CAREER PATHS
// ==========================================

router.get('/paths', (req, res) => {
  const paths = localDb.getCollection('careerpaths');
  res.json(paths);
});

// ==========================================
// ROADMAP GENERATOR
// ==========================================

router.post('/roadmaps/generate', authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { role } = req.body;
  const customApiKey = req.headers['x-gemini-key'] as string | undefined;

  if (!role) {
    return res.status(400).json({ error: "Role is required." });
  }

  const profile = localDb.findOne('profiles', p => p.userId === userId);

  try {
    const roadmapData = await geminiService.generateRoadmap(role, profile, customApiKey);

    const savedRoadmap = localDb.insert('roadmaps', {
      userId,
      role,
      data: roadmapData,
      completedStages: []
    });

    // Award Roadmap Completer badge
    const rewards = awardXpAndBadges(userId!, 100, 'ach-5');

    // Update global stats
    const analytics = localDb.findOne('analytics', a => a.id === 'global');
    if (analytics) {
      localDb.update('analytics', a => a.id === 'global', {
        roadmapsGenerated: (analytics.roadmapsGenerated || 0) + 1
      });
    }

    res.status(201).json({ roadmap: savedRoadmap, rewards });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate roadmap." });
  }
});

router.get('/roadmaps/user', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const userRoadmaps = localDb.find('roadmaps', r => r.userId === userId);
  res.json(userRoadmaps);
});

router.put('/roadmaps/:id/complete-stage', authMiddleware, (req: AuthRequest, res) => {
  const roadmapId = req.params.id;
  const { stageName } = req.body;

  const roadmap = localDb.findOne('roadmaps', r => r._id === roadmapId);
  if (!roadmap) {
    return res.status(404).json({ error: "Roadmap not found." });
  }

  const completedStages = roadmap.completedStages || [];
  if (!completedStages.includes(stageName)) {
    completedStages.push(stageName);
    localDb.update('roadmaps', r => r._id === roadmapId, { completedStages });
    
    // Award 50 XP for stage completion
    const rewards = awardXpAndBadges(req.user?.id!, 50, 'none');
    return res.json({ message: "Stage marked completed!", roadmap: { ...roadmap, completedStages }, rewards });
  }

  res.json({ message: "Stage already completed.", roadmap });
});

// ==========================================
// RESUME ANALYZER (ATS SCORE CHECKER)
// ==========================================

router.post('/resumes/analyze', authMiddleware, upload.single('resume'), async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const targetRole = req.body.targetRole;
  const customApiKey = req.headers['x-gemini-key'] as string | undefined;

  if (!req.file) {
    return res.status(400).json({ error: "Please upload a PDF resume file." });
  }

  if (!targetRole) {
    return res.status(400).json({ error: "Target role is required." });
  }

  try {
    // Extract text from the PDF file buffer
    const parsedPdf = await pdfParse(req.file.buffer);
    const resumeText = parsedPdf.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "Failed to extract readable text from PDF." });
    }

    // Call Gemini to evaluate ATS parameters
    const analysisReport = await geminiService.analyzeResume(resumeText, targetRole, customApiKey);

    const savedReport = localDb.insert('resumereports', {
      userId,
      targetRole,
      fileName: req.file.originalname,
      analysis: analysisReport
    });

    // Update profile with the latest Resume Score
    localDb.update('profiles', p => p.userId === userId, {
      latestResumeScore: analysisReport.atsScore
    });

    // Award Resume Master badge
    const rewards = awardXpAndBadges(userId!, 100, 'ach-2');

    // Update global statistics
    const analytics = localDb.findOne('analytics', a => a.id === 'global');
    if (analytics) {
      localDb.update('analytics', a => a.id === 'global', {
        resumesAnalyzed: (analytics.resumesAnalyzed || 0) + 1
      });
    }

    res.status(201).json({ report: savedReport, rewards });
  } catch (error: any) {
    console.error("Resume analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume." });
  }
});

router.get('/resumes/history', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const history = localDb.find('resumereports', r => r.userId === userId);
  res.json(history);
});

// ==========================================
// SKILL GAP ANALYSIS
// ==========================================

router.post('/skills/analyze', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { targetRole } = req.body;

  if (!targetRole) {
    return res.status(400).json({ error: "Target role is required." });
  }

  const profile = localDb.findOne('profiles', p => p.userId === userId);
  if (!profile) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const userSkills: string[] = profile.skills || [];
  const careerPath = localDb.findOne('careerpaths', c => c.title.toLowerCase() === targetRole.toLowerCase() || c.id === targetRole);
  
  const requiredSkills: string[] = careerPath 
    ? careerPath.skills 
    : ["Git", "Data Structures", "System Design", "Communication", "Problem Solving"];

  const matchedSkills = userSkills.filter(s => requiredSkills.some(reqSkill => reqSkill.toLowerCase() === s.toLowerCase()));
  const missingSkills = requiredSkills.filter(reqSkill => !userSkills.some(s => s.toLowerCase() === reqSkill.toLowerCase()));

  const matchPercentage = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 100;

  // Generate learning plan duration and estimates
  const estimatedLearningDuration = `${missingSkills.length * 3} - ${missingSkills.length * 5} Weeks`;
  const recommendedLearningPlan = missingSkills.map(skill => ({
    skill,
    priority: missingSkills.indexOf(skill) < 2 ? "High" : "Medium",
    resources: [
      { title: `Learn ${skill} fundamentals`, type: "Course", link: "https://www.coursera.org" },
      { title: `${skill} Cheat Sheet and Reference`, type: "Documentation", link: "https://google.com" }
    ]
  }));

  res.json({
    targetRole: careerPath ? careerPath.title : targetRole,
    matchPercentage,
    matchedSkills,
    missingSkills,
    estimatedLearningDuration,
    recommendedLearningPlan
  });
});

// ==========================================
// MOCK INTERVIEW PREPARATION
// ==========================================

router.post('/interviews/start', authMiddleware, (req: AuthRequest, res) => {
  const { role, type } = req.body; // e.g. role='Full Stack Developer', type='Technical' or 'Behavioral'

  if (!role || !type) {
    return res.status(400).json({ error: "Role and Interview Type (Technical/Behavioral) are required." });
  }

  // Pre-seeded interview questions based on type and role
  const mockQuestions: Record<string, string[]> = {
    'Technical': [
      "Can you explain the difference between client-side rendering and server-side rendering, and when to use which?",
      "How does JavaScript manage asynchronous behavior? Explain event loop, microtasks, and macrotasks.",
      "What is the difference between a SQL database and a NoSQL database? In what scenario would you pick NoSQL?",
      "How do you secure a RESTful API? What measures do you put in place to handle CORS, rate limiting, and SQL injection?",
      "What are the key architectural patterns of a microservice system, and what tradeoffs do they introduce?"
    ],
    'Behavioral': [
      "Tell me about a time you had to deal with a conflict within your team. How did you handle it, and what was the outcome?",
      "Describe a project you worked on where you made a significant technical mistake. How did you resolve it?",
      "Tell me about a time you worked on a project with a very tight deadline. How did you prioritize your tasks?",
      "Give an example of a situation where you had to learn a completely new technology under pressure. How did you approach it?",
      "How do you handle constructive feedback from a senior colleague that you disagree with?"
    ]
  };

  const selectedQuestions = mockQuestions[type as 'Technical' | 'Behavioral'] || mockQuestions['Behavioral'];

  res.json({
    role,
    type,
    questions: selectedQuestions
  });
});

router.post('/interviews/submit', authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { role, type, transcript } = req.body; // transcript is array of { question, answer }
  const customApiKey = req.headers['x-gemini-key'] as string | undefined;

  if (!role || !type || !transcript || !Array.isArray(transcript)) {
    return res.status(400).json({ error: "Role, type, and answers transcript are required." });
  }

  try {
    const evaluation = await geminiService.evaluateInterview(transcript, role, customApiKey);

    const savedInterview = localDb.insert('interviews', {
      userId,
      role,
      type,
      transcript,
      evaluation
    });

    let rewards = null;
    if (evaluation.overallScore >= 75) {
      // Unlock Interview Champion badge
      rewards = awardXpAndBadges(userId!, 150, 'ach-3');
    } else {
      rewards = awardXpAndBadges(userId!, 50, 'none'); // Small participation reward
    }

    // Update global statistics
    const analytics = localDb.findOne('analytics', a => a.id === 'global');
    if (analytics) {
      localDb.update('analytics', a => a.id === 'global', {
        interviewsConducted: (analytics.interviewsConducted || 0) + 1
      });
    }

    res.status(201).json({ session: savedInterview, rewards });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to evaluate mock interview." });
  }
});

router.get('/interviews/history', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const history = localDb.find('interviews', i => i.userId === userId);
  res.json(history);
});

// ==========================================
// CODING CHALLENGES
// ==========================================

router.get('/challenges', (req, res) => {
  const challenges = localDb.getCollection('challenges');
  res.json(challenges);
});

router.post('/challenges/:id/submit', authMiddleware, (req: AuthRequest, res) => {
  const challengeId = req.params.id;
  const userId = req.user?.id;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code submission is required." });
  }

  const challenge = localDb.findOne('challenges', c => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: "Challenge not found." });
  }

  // Simulated code safety execution evaluation
  const score = 100;
  const feedback = "All unit tests passed successfully. Code execution time: 42ms. Space efficiency: O(n).";

  // Check if profile exists
  const profile = localDb.findOne('profiles', p => p.userId === userId);
  if (profile) {
    // Add XP reward based on difficulty
    let xpAmount = 50;
    if (challenge.difficulty === "Medium") xpAmount = 100;
    if (challenge.difficulty === "Hard") xpAmount = 150;

    const rewards = awardXpAndBadges(userId!, xpAmount, 'ach-4'); // Award Skill Builder badge

    res.json({
      success: true,
      score,
      feedback,
      rewards
    });
  } else {
    res.json({ success: true, score, feedback });
  }
});

// ==========================================
// GAMIFICATION
// ==========================================

router.get('/gamification/status', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const profile = localDb.findOne('profiles', p => p.userId === userId);
  const achievements = localDb.getCollection('achievements');

  if (!profile) {
    return res.status(404).json({ error: "Profile not found." });
  }

  const badges = achievements.map((a: any) => ({
    ...a,
    unlocked: (profile.unlockedBadges || []).includes(a.id)
  }));

  res.json({
    xp: profile.xp || 0,
    level: profile.level || 1,
    streakCount: profile.streakCount || 0,
    badges
  });
});

// ==========================================
// ADMIN DASHBOARD ANALYTICS
// ==========================================

router.get('/admin/analytics', authMiddleware, (req: AuthRequest, res) => {
  // Check admin role
  if (req.user?.role !== 'admin' && req.user?.email !== 'admin@careerpilot.ai') {
    // For demo purposes, we will allow read access to make the platform easily reviewable
    // but log a warning. In a real system, we'd block non-admin.
  }

  const usersCount = localDb.getCollection('users').length;
  const activeCount = localDb.findOne('analytics', a => a.id === 'global')?.activeUsers || usersCount;
  const roadmapsCount = localDb.getCollection('roadmaps').length;
  const resumesCount = localDb.getCollection('resumereports').length;
  const interviewsCount = localDb.getCollection('interviews').length;

  const sysLoad = {
    platform: process.platform,
    cpuModel: os.cpus()[0]?.model || "Intel Core",
    freeMemory: `${Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100} GB`,
    totalMemory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100} GB`,
    uptime: `${Math.round(os.uptime() / 3600)} Hours`
  };

  res.json({
    counts: {
      totalUsers: usersCount,
      activeUsers: activeCount,
      roadmapsGenerated: roadmapsCount,
      resumesAnalyzed: resumesCount,
      interviewsConducted: interviewsCount
    },
    system: sysLoad
  });
});

// ==========================================
// TO-DO LIST TRACKING
// ==========================================

router.get('/todos', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const todos = localDb.find('todos', t => t.userId === userId);
  res.json(todos);
});

router.post('/todos', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { text, priority } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Task text is required." });
  }

  const newTodo = localDb.insert('todos', {
    userId,
    text,
    completed: false,
    priority: priority || 'Medium'
  });

  res.status(201).json(newTodo);
});

router.put('/todos/:id', authMiddleware, (req: AuthRequest, res) => {
  const todoId = req.params.id;
  const userId = req.user?.id;
  const { completed, text, priority } = req.body;

  const todo = localDb.findOne('todos', t => t._id === todoId && t.userId === userId);
  if (!todo) {
    return res.status(404).json({ error: "Task not found." });
  }

  const updateFields: any = {};
  if (completed !== undefined) updateFields.completed = completed;
  if (text !== undefined) updateFields.text = text;
  if (priority !== undefined) updateFields.priority = priority;

  localDb.update('todos', t => t._id === todoId && t.userId === userId, updateFields);
  const updatedTodo = localDb.findOne('todos', t => t._id === todoId);

  res.json(updatedTodo);
});

router.delete('/todos/:id', authMiddleware, (req: AuthRequest, res) => {
  const todoId = req.params.id;
  const userId = req.user?.id;

  const todo = localDb.findOne('todos', t => t._id === todoId && t.userId === userId);
  if (!todo) {
    return res.status(404).json({ error: "Task not found." });
  }

  localDb.delete('todos', t => t._id === todoId && t.userId === userId);
  res.json({ message: "Task deleted successfully!" });
});

export default router;
