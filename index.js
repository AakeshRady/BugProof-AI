import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./storage.js";
import { validateSubmission } from "./aiValidator.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BugProof AI is running");
});

/**
 * Create bounty
 */
app.post("/bounty/create", (req, res) => {
  const { title, description, reward } = req.body;

  const bounty = {
    id: db.bounties.length + 1,
    title,
    description,
    reward,
    remaining: reward
  };

  db.bounties.push(bounty);

  res.json({ success: true, bounty });
});

/**
 * Get all bounties
 */
app.get("/bounty", (req, res) => {
  res.json(db.bounties);
});

/**
 * Submit solution
 */
app.post("/submit", async (req, res) => {
  const { bountyId, code, explanation } = req.body;

  const bounty = db.bounties.find(b => b.id == bountyId);
  if (!bounty) {
    return res.status(404).json({ error: "Bounty not found" });
  }

  // prevent duplicate submissions
  const duplicate = db.submissions.find(
    s => s.code === code && s.bountyId == bountyId
  );

  if (duplicate) {
    return res.json({ error: "Duplicate submission detected" });
  }

  const result = await validateSubmission(
    bounty.description,
    code,
    explanation
  );

  const submission = {
    id: db.submissions.length + 1,
    bountyId,
    code,
    explanation,
    status: result.approved ? "approved" : "rejected",
    score: result.score,
    confidence: result.confidence
  };

  if (result.approved && bounty.remaining > 0) {
    submission.rewardClaimable = true;
    bounty.remaining -= bounty.reward * 0.1; // simple reward split
  } else {
    submission.rewardClaimable = false;
  }

  db.submissions.push(submission);

  res.json({
    success: true,
    submission
  });
});

/**
 * Get submissions
 */
app.get("/submissions", (req, res) => {
  res.json(db.submissions);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("BugProof AI running on port 3000");
});
