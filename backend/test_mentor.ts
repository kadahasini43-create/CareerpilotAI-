import { geminiService } from './src/services/geminiService';

async function runTest() {
  console.log("=== Testing TypeScript query ===");
  const reply1 = await geminiService.chatWithMentor(
    "Write a binary search algorithm in TypeScript",
    [],
    { dreamRole: "Full Stack Developer", skills: ["JavaScript", "HTML"], education: "B.Tech", experienceLevel: "Beginner" }
  );
  console.log(reply1);

  console.log("\n=== Testing PM Transition query ===");
  const reply2 = await geminiService.chatWithMentor(
    "How do I switch careers into Product Management?",
    [],
    { dreamRole: "Product Manager", skills: ["Excel"], education: "MBA", experienceLevel: "Intermediate" }
  );
  console.log(reply2);

  console.log("\n=== Testing Fallback query ===");
  const reply3 = await geminiService.chatWithMentor(
    "Explain JSON vs XML",
    [],
    { dreamRole: "Data Engineer", skills: [], education: "B.Sc", experienceLevel: "Beginner" }
  );
  console.log(reply3);
}

runTest().catch(console.error);
