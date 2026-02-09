import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";

// Constants
const CHOICES = ["rock", "paper", "scissors"];
const REWARDS = [5, 0, 10, 2, 15, 20, 3];
const WIN_STREAK_THRESHOLD = 3;
const LOCK_DURATION_MS =
  process.env.NODE_ENV === "development"
    ? 1 * 60 * 1000 // 1 minute for testing
    : 24 * 60 * 60 * 1000; // 24 hours for production

export const playRps = async (req, res, next) => {
  const { userChoice } = req.body;
  const userId = req.user.id;

  if (!userId) return next(handleMakeError(400, "User not found!"));

  try {
    const currentUser = await User.findById(userId).select(
      "winCount playLock credits"
    );

    // Check lock
    if (currentUser.playLock && currentUser.playLock > new Date()) {
      return next(handleMakeError(429, "Please wait before playing again"));
    }

    const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    const computerChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];

    let result;
    let rewardEarned = 0;

    if (userChoice === computerChoice) {
      result = "Boring... it's a draw.";
    } else if (
      (userChoice === "rock" && computerChoice === "scissors") ||
      (userChoice === "scissors" && computerChoice === "paper") ||
      (userChoice === "paper" && computerChoice === "rock")
    ) {
      const newWinCount = currentUser.winCount + 1;

      if (newWinCount >= WIN_STREAK_THRESHOLD) {
        rewardEarned = randomReward;
        result = `Congratulations! You won ${rewardEarned} credits!`;

        await User.findByIdAndUpdate(
          userId,
          {
            $inc: { credits: rewardEarned },
            $set: { winCount: 0, playLock: new Date(Date.now() + LOCK_DURATION_MS) },
          },
          { new: true }
        );
      } else {
        result = "Congrats! you win.";
        await User.findByIdAndUpdate(
          userId,
          { $set: { winCount: newWinCount } },
          { new: true }
        );
      }
    } else {
      result = "Too bad, you lose.";
      const newWinCount = Math.max(0, currentUser.winCount - 1);
      await User.findByIdAndUpdate(userId, { $set: { winCount: newWinCount } });
    }

    const updatedUser = await User.findById(userId).select(
      "credits winCount playLock"
    );

    res.status(200).json({
      result,
      computerChoice,
      reward: rewardEarned,
      userChoice,
      winCount: updatedUser.winCount,
      credits: updatedUser.credits,
      lockedUntil: updatedUser.playLock,
    });
  } catch (error) {
    next(error);
  }
};

export const resetLock = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const currentUser = await User.findById(userId).select("playLock");

    if (!currentUser) return next(handleMakeError(400, "User not found!"));

    const now = new Date();

    if (!currentUser.playLock || new Date(currentUser.playLock) <= now) {
      await User.findByIdAndUpdate(
        userId,
        { $set: { playLock: null } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Lock reset successfully", unlocked: true });
    }

    const lockExpiry = new Date(currentUser.playLock).toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return res.status(200).json({ lockedUntil: lockExpiry });
  } catch (error) {
    next(error);
  }
};

