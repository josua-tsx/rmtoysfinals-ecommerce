import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";

export const playRps = async (req, res, next) => {
  const { userChoice } = req.body;
  const userId = req.user.id;

  if (!userId) return next(handleMakeError(400, "User not found!"));

  try {
    const choices = ["rock", "paper", "scissors"];
    const rewards = [5, 0, 25, 1, 50, 2, 100];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    let result;

    if (userChoice === computerChoice) {
      result = "draw";
    } else if (
      (userChoice === "rock" && computerChoice === "scissors") ||
      (userChoice === "scissors" && computerChoice === "paper") ||
      (userChoice === "paper" && computerChoice === "rock")
    ) {
      result = "win";
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: { credits: randomReward, winCount: 1 },
        },
        { new: true }
      );
    } else {
      result = "lose";

      const currentUser = await User.findById(userId).select("winCount");

      if (currentUser.winCount > 0) {
        await User.findByIdAndUpdate(
          userId,
          {
            $inc: { winCount: -1 },
          },
          { new: true }
        );
      }
    }

    const updatedUser = await User.findById(userId).select("credits winCount");

    res.status(200).json({
      result,
      computerChoice,
      randomReward: result === "win" ? randomReward : 0, // reward only on win
      userChoice,
      winCount: updatedUser.winCount,
      credits: updatedUser.credits,
    });
  } catch (error) {
    next(error);
  }
};
