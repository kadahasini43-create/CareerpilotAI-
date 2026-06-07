import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'local_db.json');

interface Schema {
  users: any[];
  profiles: any[];
  careerpaths: any[];
  roadmaps: any[];
  resumereports: any[];
  interviews: any[];
  challenges: any[];
  resources: any[];
  achievements: any[];
  streaks: any[];
  analytics: any[];
  todos: any[];
}

const defaultDb: Schema = {
  users: [],
  profiles: [],
  todos: [],
  careerpaths: [
    {
      id: "full-stack",
      title: "Full Stack Development",
      description: "Build both frontend client interfaces and backend server architectures.",
      skills: ["React", "Next.js", "Node.js", "Express", "MongoDB", "SQL", "Tailwind CSS"],
      difficulty: "Medium",
      salary: "$85,000 - $140,000",
      growth: "High (15% YoY)",
      timeline: "6 - 9 Months"
    },
    {
      id: "ai-ml",
      title: "AI / Machine Learning",
      description: "Design and deploy intelligence models, neural networks, and LLM interfaces.",
      skills: ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "FastAPI", "Prompt Engineering"],
      difficulty: "Hard",
      salary: "$110,000 - $180,000",
      growth: "Explosive (35% YoY)",
      timeline: "9 - 12 Months"
    },
    {
      id: "data-science",
      title: "Data Science",
      description: "Analyze complex datasets, generate predictive insights, and deploy visualization pipelines.",
      skills: ["Python", "R", "SQL", "Pandas", "Tableau", "PowerBI", "Statistics"],
      difficulty: "Medium",
      salary: "$95,000 - $150,000",
      growth: "High (20% YoY)",
      timeline: "6 - 8 Months"
    },
    {
      id: "cybersecurity",
      title: "Cybersecurity Analyst",
      description: "Protect systems, networks, and applications from cyber attacks and data breaches.",
      skills: ["Network Security", "Linux", "Penetration Testing", "Wireshark", "CEH", "OWASP"],
      difficulty: "Hard",
      salary: "$90,000 - $160,000",
      growth: "Very High (28% YoY)",
      timeline: "8 - 12 Months"
    },
    {
      id: "cloud-computing",
      title: "Cloud Engineering",
      description: "Design, deploy, and manage highly scalable and resilient cloud architectures.",
      skills: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux", "Terraform"],
      difficulty: "Medium",
      salary: "$100,000 - $170,000",
      growth: "High (18% YoY)",
      timeline: "6 - 9 Months"
    },
    {
      id: "devops",
      title: "DevOps Engineering",
      description: "Bridge the gap between development and operations through automated CI/CD and monitoring.",
      skills: ["Docker", "Kubernetes", "CI/CD (GitHub Actions/Jenkins)", "Terraform", "Linux", "AWS"],
      difficulty: "Hard",
      salary: "$105,000 - $175,000",
      growth: "High (22% YoY)",
      timeline: "6 - 9 Months"
    },
    {
      id: "ui-ux",
      title: "UI/UX Design",
      description: "Craft visually stunning, accessible, and intuitive user experiences and design systems.",
      skills: ["Figma", "Adobe XD", "Wireframing", "User Research", "Prototyping", "Design Tokens"],
      difficulty: "Easy",
      salary: "$70,000 - $125,000",
      growth: "Medium (10% YoY)",
      timeline: "4 - 6 Months"
    },
    {
      id: "mobile-dev",
      title: "Mobile App Development",
      description: "Build native and cross-platform mobile experiences for iOS and Android.",
      skills: ["React Native", "Flutter", "Swift", "Kotlin", "TypeScript", "App Store Deployment"],
      difficulty: "Medium",
      salary: "$80,000 - $135,000",
      growth: "High (12% YoY)",
      timeline: "5 - 8 Months"
    },
    {
      id: "product-mgmt",
      title: "Product Management",
      description: "Lead product strategy, define roadmaps, and coordinate between engineering, design, and business.",
      skills: ["Agile", "Scrum", "Product Analytics", "Jira", "Market Research", "Roadmapping"],
      difficulty: "Medium",
      salary: "$95,000 - $160,000",
      growth: "High (14% YoY)",
      timeline: "6 - 9 Months"
    }
  ],
  roadmaps: [],
  resumereports: [],
  interviews: [],
  challenges: [
    {
      id: "challenge-1",
      title: "Two Sum",
      category: "Arrays",
      difficulty: "Easy",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
      starterCode: "function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}",
      testCases: [
        { input: "([2, 7, 11, 15], 9)", output: "[0, 1]" },
        { input: "([3, 2, 4], 6)", output: "[1, 2]" }
      ]
    },
    {
      id: "challenge-2",
      title: "Reverse a Linked List",
      category: "Linked Lists",
      difficulty: "Medium",
      description: "Given the head of a singly linked list, reverse the list, and return its head.",
      starterCode: "function reverseList(head) {\n  // Write your code here\n  return head;\n}",
      testCases: [
        { input: "[1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]" }
      ]
    },
    {
      id: "challenge-3",
      title: "Longest Common Subsequence",
      category: "Dynamic Programming",
      difficulty: "Hard",
      description: "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
      starterCode: "function longestCommonSubsequence(text1, text2) {\n  // Write your code here\n  return 0;\n}",
      testCases: [
        { input: "(\"abcde\", \"ace\")", output: "3" }
      ]
    },
    {
      id: "challenge-4",
      title: "Valid Anagram",
      category: "Strings",
      difficulty: "Easy",
      description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
      starterCode: "function isAnagram(s, t) {\n  // Write your code here\n  return false;\n}",
      testCases: [
        { input: "(\"anagram\", \"nagaram\")", output: "true" },
        { input: "(\"rat\", \"car\")", output: "false" }
      ]
    },
    {
      id: "challenge-5",
      title: "LRU Cache",
      category: "System Design",
      difficulty: "Hard",
      description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
      starterCode: "class LRUCache {\n  constructor(capacity) {}\n  get(key) {}\n  put(key, value) {}\n}",
      testCases: [
        { input: "Capacity: 2", output: "Initialized" }
      ]
    },
    {
      id: "challenge-6",
      title: "Validate Binary Search Tree",
      category: "Trees",
      difficulty: "Medium",
      description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
      starterCode: "function isValidBST(root) {\n  // Write your code here\n  return true;\n}",
      testCases: [
        { input: "[2, 1, 3]", output: "true" },
        { input: "[5, 1, 4, null, null, 3, 6]", output: "false" }
      ]
    },
    {
      id: "challenge-7",
      title: "Merge Intervals",
      category: "Arrays",
      difficulty: "Medium",
      description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals.",
      starterCode: "function merge(intervals) {\n  // Write your code here\n  return [];\n}",
      testCases: [
        { input: "[[1, 3], [2, 6], [8, 10], [15, 18]]", output: "[[1, 6], [8, 10], [15, 18]]" }
      ]
    },
    {
      id: "challenge-8",
      title: "Edit Distance",
      category: "Dynamic Programming",
      difficulty: "Hard",
      description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
      starterCode: "function minDistance(word1, word2) {\n  // Write your code here\n  return 0;\n}",
      testCases: [
        { input: "(\"horse\", \"ros\")", output: "3" }
      ]
    },
    {
      id: "challenge-9",
      title: "API Rate Limiter",
      category: "System Design",
      difficulty: "Medium",
      description: "Design an API Rate Limiter using the token bucket algorithm that limits users to a set capacity of requests per window.",
      starterCode: "class RateLimiter {\n  constructor(limit, windowMs) {}\n  allowRequest(clientId) {\n    return true;\n  }\n}",
      testCases: [
        { input: "Limit: 100", output: "Initialized" }
      ]
    },
    {
      id: "challenge-10",
      title: "Valid Parentheses",
      category: "Strings",
      difficulty: "Easy",
      description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      starterCode: "function isValid(s) {\n  // Write your code here\n  return false;\n}",
      testCases: [
        { input: "\"()[]{}\"", output: "true" },
        { input: "\"(]\"", output: "false" }
      ]
    },
    {
      id: "challenge-11",
      title: "Kth Largest Element",
      category: "Arrays",
      difficulty: "Medium",
      description: "Given an integer array `nums` and an integer `k`, return the `k`-th largest element in the array.",
      starterCode: "function findKthLargest(nums, k) {\n  // Write your code here\n  return 0;\n}",
      testCases: [
        { input: "([3,2,1,5,6,4], 2)", output: "5" }
      ]
    },
    {
      id: "challenge-12",
      title: "Lowest Common Ancestor",
      category: "Trees",
      difficulty: "Medium",
      description: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.",
      starterCode: "function lowestCommonAncestor(root, p, q) {\n  // Write your code here\n  return root;\n}",
      testCases: [
        { input: "[3,5,1,6,2,0,8], p=5, q=1", output: "3" }
      ]
    },
    {
      id: "challenge-13",
      title: "URL Shortener System",
      category: "System Design",
      difficulty: "Medium",
      description: "Design a URL Shortener system (like TinyURL) that generates short aliases for long URLs and redirects visitors to the original address.",
      starterCode: "class URLShortener {\n  constructor() {}\n  encode(longUrl) {\n    return \"\";\n  }\n  decode(shortUrl) {\n    return \"\";\n  }\n}",
      testCases: [
        { input: "URL: google.com", output: "Shortened" }
      ]
    }
  ],
  resources: [
    {
      id: "res-1",
      title: "Full-Stack Web Development Course",
      category: "Full Stack Development",
      type: "Course",
      provider: "MDN & Odin Project",
      link: "https://theodinproject.com",
      level: "Beginner"
    },
    {
      id: "res-2",
      title: "Machine Learning by Andrew Ng",
      category: "AI/ML",
      type: "Course",
      provider: "DeepLearning.AI",
      link: "https://www.deeplearning.ai",
      level: "Intermediate"
    },
    {
      id: "res-3",
      title: "Google UX Design Professional Certificate",
      category: "UI/UX Design",
      type: "Certification",
      provider: "Coursera",
      link: "https://www.coursera.org",
      level: "Beginner"
    },
    {
      id: "res-4",
      title: "Docker and Kubernetes: The Complete Guide",
      category: "DevOps",
      type: "Course",
      provider: "Udemy",
      link: "https://www.udemy.com",
      level: "Intermediate"
    }
  ],
  achievements: [
    { id: "ach-1", title: "Career Explorer", description: "Completed career path onboarding.", xpReward: 100, icon: "compass" },
    { id: "ach-2", title: "Resume Master", description: "Uploaded and analyzed your first resume.", xpReward: 150, icon: "file-text" },
    { id: "ach-3", title: "Interview Champion", description: "Completed a mock interview with score > 75%.", xpReward: 250, icon: "award" },
    { id: "ach-4", title: "Skill Builder", description: "Successfully solved a coding challenge.", xpReward: 200, icon: "zap" },
    { id: "ach-5", title: "Roadmap Completer", description: "Generated a career progression roadmap.", xpReward: 150, icon: "map" }
  ],
  streaks: [],
  analytics: [
    {
      id: "global",
      totalUsers: 0,
      activeUsers: 0,
      roadmapsGenerated: 0,
      resumesAnalyzed: 0,
      interviewsConducted: 0
    }
  ]
};

class LocalDb {
  private data: Schema;

  constructor() {
    this.data = { ...defaultDb };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Deep merge or restore empty keys
        this.data = {
          users: parsed.users || [],
          profiles: parsed.profiles || [],
          careerpaths: parsed.careerpaths || defaultDb.careerpaths,
          roadmaps: parsed.roadmaps || [],
          resumereports: parsed.resumereports || [],
          interviews: parsed.interviews || [],
          challenges: parsed.challenges || defaultDb.challenges,
          resources: parsed.resources || defaultDb.resources,
          achievements: parsed.achievements || defaultDb.achievements,
          streaks: parsed.streaks || [],
          analytics: parsed.analytics || defaultDb.analytics,
          todos: parsed.todos || []
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load local DB, resetting to defaults", e);
      this.data = { ...defaultDb };
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to save local DB", e);
    }
  }

  public getCollection<K extends keyof Schema>(collection: K): Schema[K] {
    this.load();
    return this.data[collection];
  }

  public find<K extends keyof Schema>(collection: K, filterFn?: (item: any) => boolean): Schema[K] {
    const list = this.getCollection(collection);
    if (filterFn) {
      return list.filter(filterFn) as Schema[K];
    }
    return list;
  }

  public findOne<K extends keyof Schema>(collection: K, filterFn: (item: any) => boolean): any | null {
    const list = this.getCollection(collection);
    return list.find(filterFn) || null;
  }

  public insert<K extends keyof Schema>(collection: K, doc: any): any {
    this.load();
    const docWithId = {
      _id: doc._id || Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    (this.data[collection] as any[]).push(docWithId);
    this.save();
    return docWithId;
  }

  public update<K extends keyof Schema>(collection: K, filterFn: (item: any) => boolean, updateData: any): boolean {
    this.load();
    const index = (this.data[collection] as any[]).findIndex(filterFn);
    if (index !== -1) {
      this.data[collection][index] = {
        ...this.data[collection][index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return true;
    }
    return false;
  }

  public delete<K extends keyof Schema>(collection: K, filterFn: (item: any) => boolean): boolean {
    this.load();
    const list = this.data[collection] as any[];
    const initialLength = list.length;
    this.data[collection] = list.filter(item => !filterFn(item)) as any;
    if (this.data[collection].length < initialLength) {
      this.save();
      return true;
    }
    return false;
  }
}

export const localDb = new LocalDb();
