import dotenv from "dotenv";
import { dbStore } from "./store.js";

dotenv.config();

async function runSeed() {
  console.log("--- Starting LearnTwin Database Seeding ---");
  await dbStore.init();
  const health = dbStore.getHealth();
  console.log(`Seeded successfully (dbMode=${health.dbMode}, sqliteConnected=${health.sqliteConnected}):`);
  console.log("- " + dbStore.getAllConcepts().length + " Concepts across 5 clusters");
  console.log("- " + dbStore.getAllMisconceptions().length + " Misconceptions in catalog");
  console.log("- " + dbStore.getAllQuestions().length + " Questions with misconception distractors");
  console.log("- " + dbStore.getAllResources().length + " Multi-modal learning resources");
  console.log("- " + health.counts.users + " User accounts in database");
  console.log("--- Seeding Complete ---");
  process.exit(0);
}

runSeed().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
