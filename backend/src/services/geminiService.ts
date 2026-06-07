import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Helper to check if API key exists and is valid (not placeholder)
const isGeminiAvailable = (apiKeyOverride?: string): boolean => {
  const key = apiKeyOverride || GEMINI_API_KEY;
  return key.trim().length > 0 && !key.includes('YOUR_');
};

async function callGemini(prompt: string, jsonMode = false, apiKeyOverride?: string): Promise<string> {
  const apiKey = apiKeyOverride || GEMINI_API_KEY;
  if (!isGeminiAvailable(apiKeyOverride)) {
    throw new Error("Gemini API key is not configured.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: jsonMode ? {
          responseMimeType: "application/json"
        } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned error: ${response.status} - ${errText}`);
    }

    const data = (await response.json()) as any;
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("Invalid response structure from Gemini API");
    }
    return resultText;
  } catch (error: any) {
    console.error("Error in Gemini API call:", error.message);
    throw error;
  }
}

export const geminiService = {
  /**
   * AI Career Mentorship Chat
   */
  async chatWithMentor(message: string, history: { role: string; content: string }[], profile: any, apiKeyOverride?: string): Promise<string> {
    const userContext = profile ? `
The user is a ${profile.experienceLevel || 'student/fresher'} pursuing a career in ${profile.dreamRole || 'their dream role'}.
Their current skills: ${profile.skills?.join(', ') || 'Not specified'}.
Education: ${profile.education || 'Not specified'}, Degree: ${profile.degree || 'Not specified'}.
Interests: ${profile.careerInterests?.join(', ') || 'Not specified'}.
` : '';

    const historyStr = history.map(h => `${h.role === 'user' ? 'User' : 'Mentor'}: ${h.content}`).join('\n');
    const prompt = `You are CareerPilot AI, an elite, futuristic career mentor and programming coach.
Only return the direct, clean answer to the user's question. Do not add any introduction, greeting wrapper, conclusion, or filler text.
If the user says a greeting (like "hey", "hello", "hi"), reply with a brief, friendly chatbot introduction: "Hey! I'm CareerPilot AI, how can I help you with your career today?"
If the user asks a coding, algorithm, or technical question, return only the code block in markdown format, followed immediately by the Big O complexity (Time & Space).
Do not use headers like 'Mini Gemini AI' or any template branding. Keep the response completely direct and clean.

CONTEXT:
${userContext}

CONVERSATION HISTORY:
${historyStr}

NEW USER MESSAGE:
${message}

Provide your response now in beautiful Markdown:`;

    if (!isGeminiAvailable(apiKeyOverride)) {
      // High-quality simulated responses
      return getMockMentorResponse(message, profile);
    }

    try {
      return await callGemini(prompt, false, apiKeyOverride);
    } catch (e) {
      return getMockMentorResponse(message, profile);
    }
  },

  /**
   * Resume ATS Analysis
   */
  async analyzeResume(resumeText: string, targetRole: string, apiKeyOverride?: string): Promise<any> {
    const prompt = `You are an expert resume analyzer and ATS (Applicant Tracking System) scoring bot.
Analyze the following resume text against the target role: "${targetRole}".
Return a JSON object containing the evaluation.

JSON SCHEMA:
{
  "atsScore": number (0 to 100),
  "formattingScore": number (0 to 100),
  "keywordScore": number (0 to 100),
  "skillsScore": number (0 to 100),
  "strengths": string[],
  "weaknesses": string[],
  "missingKeywords": string[],
  "missingSkills": string[],
  "improvements": string[],
  "roleMatchPercentage": number (0 to 100)
}

RESUME TEXT:
${resumeText}

Provide only the JSON output without markdown backticks.`;

    if (!isGeminiAvailable(apiKeyOverride)) {
      return getMockResumeAnalysis(resumeText, targetRole);
    }

    try {
      const responseText = await callGemini(prompt, true, apiKeyOverride);
      return JSON.parse(responseText);
    } catch (e) {
      return getMockResumeAnalysis(resumeText, targetRole);
    }
  },

  /**
   * Generate Career Roadmap
   */
  async generateRoadmap(targetRole: string, profile: any, apiKeyOverride?: string): Promise<any> {
    const userContext = profile ? `
Current Skills: ${profile.skills?.join(', ') || 'None'}.
Experience Level: ${profile.experienceLevel || 'Beginner'}.
` : '';

    const prompt = `You are a career development architect. Create a structured roadmap for the target role: "${targetRole}".
${userContext}
Divide the roadmap into four distinct stages: "Beginner", "Intermediate", "Advanced", and "Industry Ready".
Return a JSON object containing the stages and actionable projects, skills, certifications, and resources.

JSON SCHEMA:
{
  "role": "${targetRole}",
  "stages": [
    {
      "name": "Beginner",
      "duration": "e.g., 2 Months",
      "skills": string[],
      "projects": [
        { "title": "string", "description": "string" }
      ],
      "certifications": string[],
      "resources": [
        { "title": "string", "type": "Course/Video/Book", "link": "string" }
      ],
      "practicePlatforms": string[]
    },
    ... (similarly for Intermediate, Advanced, Industry Ready)
  ]
}

Provide only the JSON output without markdown backticks.`;

    if (!isGeminiAvailable(apiKeyOverride)) {
      return getMockRoadmap(targetRole);
    }

    try {
      const responseText = await callGemini(prompt, true, apiKeyOverride);
      return JSON.parse(responseText);
    } catch (e) {
      return getMockRoadmap(targetRole);
    }
  },

  /**
   * Evaluate Interview Session
   */
  async evaluateInterview(transcript: { question: string; answer: string }[], role: string, apiKeyOverride?: string): Promise<any> {
    const transcriptText = transcript.map((t, idx) => `Q${idx + 1}: ${t.question}\nA${idx + 1}: ${t.answer}`).join('\n\n');
    const prompt = `You are an expert technical and behavioral interviewer.
Evaluate the following interview transcript for a "${role}" position.
Determine scores out of 100 for Technical, Communication, and Confidence.
Provide a detailed evaluation report.

JSON SCHEMA:
{
  "technicalScore": number (0 to 100),
  "communicationScore": number (0 to 100),
  "confidenceScore": number (0 to 100),
  "overallScore": number (0 to 100),
  "strengths": string[],
  "constructiveFeedback": string[],
  "recommendedTopicsToStudy": string[],
  "detailedQnAEvaluation": [
    {
      "question": "string",
      "answer": "string",
      "score": number (0 to 100),
      "feedback": "string",
      "sampleAnswer": "string"
    }
  ]
}

TRANSCRIPT:
${transcriptText}

Provide only the JSON output without markdown backticks.`;

    if (!isGeminiAvailable(apiKeyOverride)) {
      return getMockInterviewEvaluation(transcript, role);
    }

    try {
      const responseText = await callGemini(prompt, true, apiKeyOverride);
      return JSON.parse(responseText);
    } catch (e) {
      return getMockInterviewEvaluation(transcript, role);
    }
  }
};

// ==========================================
// HIGH-FIDELITY FALLBACK / SIMULATION MOCKS
// ==========================================
function getMockMentorResponse(message: string, profile: any): string {
  const lowercaseMsg = message.toLowerCase().trim();
  const dreamRole = profile?.dreamRole || 'Software Engineer';
  const education = profile?.education || 'your current field';
  const skills = profile?.skills?.join(', ') || 'general development';
  const expLevel = profile?.experienceLevel || 'Beginner';

  const has = (...terms: string[]) => terms.some(t => lowercaseMsg.includes(t));

  // --- RULE 1: CONVERSATIONAL GREETINGS (SHORT & SIMPLE) ---
  if (lowercaseMsg === 'hey' || lowercaseMsg === 'hello' || lowercaseMsg === 'hi' || lowercaseMsg === 'yo') {
    return `Hey! I'm CareerPilot AI. How can I help you with your career today?`;
  }
  
  if (has('hey ', 'hello ', 'hi ', 'whats up', 'greetings') && lowercaseMsg.length < 15) {
    return `Hey! I'm CareerPilot AI. Ready to work on career upskilling, resume analysis, or coding? Let me know!`;
  }

  // --- RULE 2: BOT IDENTITY ---
  if (has('who are you', 'what is your name', 'what are you', 'explain yourself', 'about you')) {
    return `I'm CareerPilot AI, a career mentor chatbot here to help you optimize resumes, prepare for mock interviews, create roadmaps, and solve coding challenges.`;
  }

  // --- RULE 3: CODE SNIPPET GENERATOR (DYNAMIC ALGORITHMS) ---
  const isCodingRequest = has('write', 'code', 'implement', 'program', 'function', 'syntax', 'script', 'example');
  
  if (isCodingRequest || has('binary search', 'fibonacci', 'factorial', 'two sum', 'quicksort', 'fizzbuzz', 'bubble sort', 'loop')) {
    // Determine language
    let lang = 'python'; // Default
    if (has('javascript', 'js')) lang = 'javascript';
    else if (has('typescript', 'ts')) lang = 'typescript';
    else if (has('java')) lang = 'java';
    else if (has('c++', 'cpp')) lang = 'cpp';
    else if (has('golang', 'go ')) lang = 'go';
    else if (has('rust')) lang = 'rust';
    else if (has('sql')) lang = 'sql';
    else if (has('html', 'css')) lang = 'html';

    // Determine algorithm
    if (has('binary search')) {
      if (lang === 'python') {
        return `\`\`\`python
# Binary Search Implementation (Python)
def binary_search(arr: list, target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`
Time Complexity: O(log N) | Space Complexity: O(1)`;
      } else if (lang === 'javascript' || lang === 'typescript') {
        return `\`\`\`typescript
// Binary Search Implementation (TypeScript)
function binarySearch(arr: number[], target: number): number {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`
Time Complexity: O(log N) | Space Complexity: O(1)`;
      } else {
        return `\`\`\`cpp
// Binary Search Implementation (C++)
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`
Time Complexity: O(log N) | Space Complexity: O(1)`;
      }
    }

    if (has('fibonacci')) {
      if (lang === 'python') {
        return `\`\`\`python
# Fibonacci Sequence Generator (Python)
def fibonacci(n: int) -> int:
    if n <= 0: return 0
    if n == 1: return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
\`\`\`
Time Complexity: O(N) | Space Complexity: O(1)`;
      } else {
        return `\`\`\`javascript
// Fibonacci Generator (JavaScript)
function fibonacci(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}
\`\`\`
Time Complexity: O(N) | Space Complexity: O(1)`;
      }
    }

    if (has('factorial')) {
      return `\`\`\`python
# Factorial Generator (Python)
def factorial(n: int) -> int:
    if n < 0:
        raise ValueError("Factorial not defined for negative numbers.")
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
\`\`\`
Time Complexity: O(N) | Space Complexity: O(1)`;
    }

    if (has('two sum')) {
      return `\`\`\`python
# Two Sum Solution (Python)
def two_sum(nums: list, target: int) -> list:
    seen = {}
    for idx, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], idx]
        seen[num] = idx
    return []
\`\`\`
Time Complexity: O(N) | Space Complexity: O(N)`;
    }

    if (has('quicksort')) {
      return `\`\`\`python
# Quicksort Implementation (Python)
def quicksort(arr: list) -> list:
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\`
Time Complexity: O(N log N) | Space Complexity: O(N)`;
    }

    if (has('fizzbuzz')) {
      return `\`\`\`javascript
// FizzBuzz Implementation (JavaScript)
function fizzBuzz(n) {
    const result = [];
    for (let i = 1; i <= n; i++) {
        if (i % 3 === 0 && i % 5 === 0) result.push("FizzBuzz");
        else if (i % 3 === 0) result.push("Fizz");
        else if (i % 5 === 0) result.push("Buzz");
        else result.push(i.toString());
    }
    return result;
}
\`\`\`
Time Complexity: O(N) | Space Complexity: O(1)`;
    }

    if (has('loop')) {
      if (lang === 'python') {
        return `\`\`\`python
# Python For Loop Range
for i in range(5):
    print(i)
\`\`\``;
      } else {
        return `\`\`\`javascript
// JavaScript For Loop
for (let i = 0; i < 5; i++) {
    console.log(i);
}
\`\`\``;
      }
    }
  }

  // --- RULE 4: COMPARISONS (VS / DIFFERENCE / COMPARE) ---
  if (has('vs', 'versus', 'difference between', 'compare')) {
    if (has('rest', 'graphql')) {
      return `| Feature | REST API | GraphQL |
| :--- | :--- | :--- |
| **Data Fetching** | Fixed payloads from specific resource paths. | Flexible queries; the client asks for exact fields. |
| **Over-fetching** | High. Often fetches unnecessary fields. | None. Returns exactly what is requested. |
| **Caching** | Native support via standard HTTP protocols. | Requires client-side cache stores (Apollo/Relay). |
| **Best Used For** | Standard CRUD apps and simple architectures. | Deeply nested entities and complex UI widgets. |`;
    }
    if (has('sql', 'nosql') || has('relational', 'document')) {
      return `| Feature | SQL Databases (Postgres, MySQL) | NoSQL Databases (MongoDB, DynamoDB) |
| :--- | :--- | :--- |
| **Schema** | Rigid, predefined tables with relations. | Flexible documents or key-value structures. |
| **Scaling** | Vertical scaling (bigger server specs). | Horizontal scaling (sharding across clusters). |
| **Transactions** | Strong ACID compliance. | Eventual consistency (BASE framework). |
| **Best Used For** | Financial records, legacy data, complex joins. | Rapid development, logging, real-time analytics. |`;
    }
    if (has('merge', 'rebase')) {
      return `*   **Git Merge:** Combines branches and creates a dedicated "Merge Commit". It preserves the chronological order of commits but makes the history graph complex.
*   **Git Rebase:** Moves your branch commits onto the tip of the target branch. It creates a clean, linear commit history, but rewrites commit IDs (never rebase shared remote branches!).`;
    }
    if (has('tcp', 'udp')) {
      return `*   **TCP (Transmission Control Protocol):** Connection-oriented, guarantees packet delivery, ordering, and flow control. Ideal for Web/HTTP, Files, and Emails.
*   **UDP (User Datagram Protocol):** Connectionless, fast and fire-and-forget. Ideal for Video Streaming, Gaming, and VoIP.`;
    }
  }

  // --- RULE 5: SPECIFIC RESUME ADVICE ---
  if (has('resume', 'cv', 'ats')) {
    return `*   **Format:** Save as a clean PDF without visual graphics, tables, or text columns.
*   **Section Titles:** Use standard names like **Professional Summary**, **Work Experience**, **Technical Skills**, and **Projects**.
*   **Keywords:** Copy exact technical keywords (like \`TypeScript\`, \`Node.js\`) from the job listing.
*   **Bullet Formula:** Write bullets as: *Action Verb* + *Task Accomplished* + *Quantifiable Metric* (e.g. *\"Refactored API routing in Express, reducing endpoint latency by 25%.\"*)`;
  }

  // --- RULE 6: INTERVIEW METHOD (STAR) ---
  if (has('interview', 'prep', 'behavioral', 'star method')) {
    return `*   **S - Situation (10%):** Set the context (e.g. *\"During our release, the database hit 100% CPU utilization...\"*)
*   **T - Task (10%):** Detail your specific responsibility.
*   **A - Action (60%):** Explain the exact coding or architectural steps *you* executed to resolve it.
*   **R - Result (20%):** State the positive numeric outcome (e.g. *\"This dropped CPU utilization to 25%.\"*)`;
  }

  // --- RULE 7: SALARY NEGOTIATION ---
  if (has('salary', 'negotiation', 'negotiate', 'compensation', 'offer')) {
    return `> *"Thank you so much for this offer! I am very excited about the chance to make an impact as a **{dreamRole}** here. Based on standard market compensation for someone with my skills in **{skills}**, I was hoping we could discuss a base salary closer to [Offer + 10%]. Is there flexibility in the base salary?"*`;
  }

  // --- RULE 8: CAREER TRANSITIONS ---
  if (has('switch', 'transition', 'change career', 'change path')) {
    return `1.  **Skills Sync (Weeks 1-6):** Target 3 core skills: **{skills}**.
2.  **Proof of Work (Weeks 7-12):** Build 2 substantial, deployable projects and store them on GitHub.
3.  **Application Pitch (Weeks 13-16):** Rephrase your educational background in **{education}** to fit **{dreamRole}** target ATS keywords.`;
  }

  // --- RULE 9: TOPIC KEYWORD LOOKUP (MOCK DATA FALLBACK) ---
  let mockData: Record<string, string> = {};
  try {
    const possiblePaths = [
      path.join(__dirname, 'mockResponses.json'),
      path.join(process.cwd(), 'src', 'services', 'mockResponses.json'),
      path.join(process.cwd(), 'backend', 'src', 'services', 'mockResponses.json'),
      path.join(__dirname, '..', 'src', 'services', 'mockResponses.json'),
      path.join(__dirname, '..', '..', 'src', 'services', 'mockResponses.json')
    ];
    let jsonPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        jsonPath = p;
        break;
      }
    }
    if (jsonPath) {
      const fileContent = fs.readFileSync(jsonPath, 'utf8');
      mockData = JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading mockResponses.json:", error);
  }

  const matches = [
    { key: 'python', val: mockData.python },
    { key: 'typescript', val: mockData.typescript },
    { key: 'javascript', val: mockData.javascript },
    { key: 'react', val: mockData.react },
    { key: 'html', val: mockData.html },
    { key: 'sql', val: mockData.sql },
    { key: 'java', val: mockData.java },
    { key: 'cpp', val: mockData.cpp },
    { key: 'golang', val: mockData.golang },
    { key: 'rust', val: mockData.rust },
    { key: 'docker', val: mockData.docker },
    { key: 'kubernetes', val: mockData.kubernetes },
    { key: 'git', val: mockData.git },
    { key: 'api', val: mockData.api },
    { key: 'jwt', val: mockData.jwt },
    { key: 'aws', val: mockData.aws },
    { key: 'algorithm', val: mockData.algorithm },
    { key: 'pm', val: mockData.pm },
    { key: 'design', val: mockData.design },
    { key: 'qa', val: mockData.qa },
    { key: 'mobile', val: mockData.mobile },
    { key: 'conflict', val: mockData.conflict }
  ];

  for (const m of matches) {
    if (lowercaseMsg.includes(m.key) && m.val) {
      // Strip Mini Gemini header lines dynamically from mockResponses
      const cleanVal = m.val
        .replace(/### Mini Gemini.*?\n+/gi, '')
        .trim();
      return cleanVal
        .replace(/{dreamRole}/g, dreamRole)
        .replace(/{skills}/g, skills)
        .replace(/{education}/g, education)
        .replace(/{expLevel}/g, expLevel);
    }
  }

  // --- RULE 10: CONCEPT ANALOGY FALLBACK (DYNAMIC EXPLANATION) ---
  const subject = extractSubject(message);
  
  let analogy = "a specialized tool inside a professional toolbox.";
  if (has('event loop')) {
    analogy = "a restaurant waiter taking orders and handing them to the kitchen (Web APIs), returning callbacks once free.";
  } else if (has('docker', 'container')) {
    analogy = "standardized shipping cargo containers that pack items of any shape/size securely to fit on any cargo ship.";
  } else if (has('kubernetes')) {
    analogy = "an orchestra conductor coordinating multiple musicians (containers) to play in perfect synchrony.";
  } else if (has('index', 'indexing')) {
    analogy = "the index page of a book, pointing you directly to a topic page rather than scanning the whole book.";
  } else if (has('jwt', 'json web token')) {
    analogy = "a signed concert wristband that allows entry to various VIP areas without re-checking your identity card.";
  } else if (has('git')) {
    analogy = "a video game saving system that lets you checkpoint files and return to them if anything breaks.";
  } else if (has('api')) {
    analogy = "a restaurant menu that lets you request specific dishes without knowing exactly how the kitchen cooks them.";
  }

  return `*   **Definition:** **${subject}** represents a key industry standard or utility that optimizes developer workflows, database efficiency, or system scalability.
*   **Analogy:** Think of it like **${analogy}**
*   **Why it Matters for a ${dreamRole}:** Knowing how to implement **${subject}** demonstrates strong design principles during technical reviews.`;
}

function extractSubject(message: string): string {
  const words = message.replace(/[?.,!]/g, '').split(/\s+/);
  const stopWords = new Set([
    'what', 'is', 'how', 'does', 'why', 'explain', 'tell', 'me', 'about', 'the', 
    'a', 'an', 'to', 'for', 'in', 'of', 'and', 'or', 'with', 'on', 'can', 'you', 
    'write', 'code', 'program', 'algorithm', 'difference', 'between', 'please',
    'should', 'i', 'do', 'we', 'use', 'using'
  ]);
  
  const keywords = words.filter(w => w && !stopWords.has(w.toLowerCase()));
  
  if (keywords.length > 0) {
    return keywords.slice(0, 3)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  
  return 'this professional concept';
}

function getMockResumeAnalysis(resumeText: string, targetRole: string): any {
  // Parse resume text lengths or content keywords to create a dynamic simulation
  const textLen = resumeText.length;
  const hasReact = resumeText.toLowerCase().includes('react');
  const hasNode = resumeText.toLowerCase().includes('node');
  const hasGit = resumeText.toLowerCase().includes('git');

  const atsScore = Math.min(60 + (textLen % 25) + (hasReact ? 10 : 0) + (hasNode ? 5 : 0), 92);
  const formattingScore = 75 + (textLen % 20);
  const keywordScore = 60 + (hasReact ? 15 : 0) + (hasNode ? 15 : 0);
  const skillsScore = 65 + (hasGit ? 15 : 0);

  return {
    atsScore,
    formattingScore,
    keywordScore,
    skillsScore,
    strengths: [
      "Clear visual hierarchy and professional font choice.",
      "Good inclusion of project descriptions with measurable outcomes.",
      hasReact ? "Demonstrated experience with React.js frontend technologies." : "Solid baseline technical project structure."
    ],
    weaknesses: [
      "Lack of metrics/quantified results in job descriptions (e.g., 'improved page speed by 25%').",
      "Short resume length limits keyword density for target ATS.",
      "Objective statement is generic; should be replaced with a professional summary."
    ],
    missingKeywords: [
      "Next.js",
      "CI/CD Pipelines",
      "Tailwind CSS",
      "Unit Testing (Jest/Cypress)"
    ],
    missingSkills: [
      "TypeScript",
      "System Design / Architecture",
      "RESTful API Integration"
    ],
    improvements: [
      "Add quantifiable achievements to your project bulletins rather than just listing tasks.",
      "Incorporate missing keywords naturally inside your experience section.",
      "Add a dedicated skills classification grid at the top of the resume."
    ],
    roleMatchPercentage: Math.round(atsScore - 3)
  };
}

function getMockRoadmap(targetRole: string): any {
  const rolesMap: Record<string, any> = {
    "full-stack": {
      role: "Full Stack Developer",
      stages: [
        {
          name: "Beginner",
          duration: "2 Months",
          skills: ["HTML5", "CSS3", "JavaScript (ES6+)", "Git & GitHub"],
          projects: [
            { title: "Personal Portfolio Website", description: "Design a responsive grid portfolio showcasing projects using HTML and CSS." },
            { title: "Dynamic Task Planner", description: "Build a web task manager application using JavaScript DOM manipulation." }
          ],
          certifications: ["FreeCodeCamp Responsive Web Design Certificate"],
          resources: [
            { title: "MDN Web Docs: Learn Web Development", type: "Documentation", link: "https://developer.mozilla.org" },
            { title: "The Odin Project: Foundations", type: "Course", link: "https://theodinproject.com" }
          ],
          practicePlatforms: ["Codewars", "Frontend Mentor"]
        },
        {
          name: "Intermediate",
          duration: "3 Months",
          skills: ["React.js", "Tailwind CSS", "Node.js Basics", "REST APIs", "SQL/NoSQL Databases"],
          projects: [
            { title: "Interactive E-Commerce Dashboard", description: "Develop an online shopping cart interface using React state and styled with Tailwind." },
            { title: "Secure User Manager Express API", description: "Create an authentication microservice with JWT tokens using Express and MongoDB." }
          ],
          certifications: ["Meta Front-End Developer Certificate (Coursera)"],
          resources: [
            { title: "React Official Documentation", type: "Documentation", link: "https://react.dev" },
            { title: "Full Stack Open - University of Helsinki", type: "Course", link: "https://fullstackopen.com" }
          ],
          practicePlatforms: ["LeetCode", "HackerRank"]
        },
        {
          name: "Advanced",
          duration: "2 Months",
          skills: ["Next.js (App Router)", "TypeScript", "State Management (Zustand/Redux)", "Docker Basics"],
          projects: [
            { title: "Collaborative Project Dashboard", description: "Build a real-time Kanban board using Next.js Server Actions, TypeScript, and WebSockets." }
          ],
          certifications: ["AWS Certified Cloud Practitioner"],
          resources: [
            { title: "Next.js Docs", type: "Documentation", link: "https://nextjs.org/docs" }
          ],
          practicePlatforms: ["LeetCode (Medium)", "Exercism"]
        },
        {
          name: "Industry Ready",
          duration: "2 Months",
          skills: ["System Design", "CI/CD Pipelines", "Jest/Cypress Testing", "Web Performance Optimization"],
          projects: [
            { title: "Full SaaS Platform with Subscription Billing", description: "Create a SaaS with authentication, database triggers, Stripe payment hooks, and continuous integration." }
          ],
          certifications: ["AWS Certified Developer - Associate"],
          resources: [
            { title: "ByteByteGo System Design", type: "Book/Course", link: "https://bytebytego.com" }
          ],
          practicePlatforms: ["System Design Fight Club"]
        }
      ]
    }
  };

  // Resolve standard or fall back to generic
  const normalizedKey = targetRole.toLowerCase().replace(/\s+/g, '-');
  if (rolesMap[normalizedKey]) {
    return rolesMap[normalizedKey];
  }

  // Generic Career Roadmap Generator
  return {
    role: targetRole,
    stages: [
      {
        name: "Beginner",
        duration: "2 Months",
        skills: ["Core Fundamentals", "Basic CLI Tools", "Version Control (Git)"],
        projects: [
          { title: "Basic Foundations Project", description: `Develop a starter project incorporating core ${targetRole} fundamentals.` }
        ],
        certifications: ["Fundamentals Certificate"],
        resources: [
          { title: "Introductory Learning Roadmap", type: "Video/Course", link: "https://youtube.com" }
        ],
        practicePlatforms: ["FreeCodeCamp"]
      },
      {
        name: "Intermediate",
        duration: "3 Months",
        skills: ["Core Frameworks", "API Integrations", "Database Architecture"],
        projects: [
          { title: "Intermediate Functional App", description: `Create a fully operational CRUD application using standard ${targetRole} frameworks.` }
        ],
        certifications: ["Associate Level Credential"],
        resources: [
          { title: "Framework Core Tutorials", type: "Course", link: "https://coursera.org" }
        ],
        practicePlatforms: ["HackerRank"]
      },
      {
        name: "Advanced",
        duration: "2 Months",
        skills: ["Advanced Paradigms", "Security & Compliance", "Cloud Deployments"],
        projects: [
          { title: "Scalable Cloud Architecture Project", description: "Deploy a distributed application featuring user sessions, caching, and secure API gateways." }
        ],
        certifications: ["Professional Cloud Architect"],
        resources: [
          { title: "Advanced Architecture Guides", type: "Documentation", link: "https://google.com" }
        ],
        practicePlatforms: ["LeetCode"]
      },
      {
        name: "Industry Ready",
        duration: "2 Months",
        skills: ["System Design", "Performance Testing & Auditing", "Agile & Product Delivery"],
        projects: [
          { title: "Production Grade SaaS Showcase", description: "Build a production-ready application with monitoring, logging, unit tests, and automatic deployment." }
        ],
        certifications: ["Expert Level Certification"],
        resources: [
          { title: "System Design and Scalability Interview prep", type: "Book", link: "https://github.com" }
        ],
        practicePlatforms: ["System Design Guides"]
      }
    ]
  };
}

function getMockInterviewEvaluation(transcript: { question: string; answer: string }[], role: string): any {
  let sumScores = 0;
  const evaluatedQnA = transcript.map((item, idx) => {
    // Generate scores based on answer length and keywords
    const ansLen = item.answer.trim().length;
    let score = 50 + (ansLen % 30);
    if (item.answer.toLowerCase().includes('because') || item.answer.toLowerCase().includes('example')) {
      score += 15;
    }
    score = Math.min(score, 98);
    sumScores += score;

    return {
      question: item.question,
      answer: item.answer,
      score,
      feedback: ansLen < 40 
        ? "Your answer is correct but too brief. Elaborate by providing concrete instances from your past projects."
        : "Excellent structure. You explained the concepts clearly. Try to link your solution to direct business impact.",
      sampleAnswer: "A high-quality answer would outline: 1. Situation, 2. Task, 3. Actions taken, 4. Concrete result achieved (using the STAR framework)."
    };
  });

  const overallScore = evaluatedQnA.length > 0 ? Math.round(sumScores / evaluatedQnA.length) : 80;
  const technicalScore = Math.max(overallScore - 4, 70);
  const communicationScore = Math.min(overallScore + 6, 95);
  const confidenceScore = Math.min(overallScore + 3, 92);

  return {
    technicalScore,
    communicationScore,
    confidenceScore,
    overallScore,
    strengths: [
      "Demonstrated strong understanding of core concepts under pressure.",
      "Clear articulation and structured thought process.",
      "Excellent technical vocabulary and relevance of answers."
    ],
    constructiveFeedback: [
      "Elaborate more on design patterns and architectural tradeoffs.",
      "Avoid pauses; structure your answering style using the STAR format (Situation, Task, Action, Result).",
      "For system design questions, mention scalability, load balancing, and database choices explicitly."
    ],
    recommendedTopicsToStudy: [
      "Object-Oriented Design Patterns",
      "Database Partitioning and Caching Strategies",
      "STAR Interview Answering Framework"
    ],
    detailedQnAEvaluation: evaluatedQnA
  };
}
