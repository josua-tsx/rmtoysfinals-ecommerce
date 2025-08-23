import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";

export const playRps = async (req, res, next) => {
  const { userChoice } = req.body;
  const userId = req.user.id;

  if (!userId) return next(handleMakeError(400, "User not found!"));

  try {
    const choices = ["rock", "paper", "scissors"];
    const rewards = [5, 0, 10, 1, 20, 2];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    // ADDED A CUSTOM DELAY FOR UI
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const currentUser = await User.findById(userId).select("winCount");

    let result;
    if (userChoice === computerChoice) {
      result = "Boring... it's a draw.";
    } else if (
      (userChoice === "rock" && computerChoice === "scissors") ||
      (userChoice === "scissors" && computerChoice === "paper") ||
      (userChoice === "paper" && computerChoice === "rock")
    ) {
      if (currentUser.winCount === 3) {
        await User.findByIdAndUpdate(
          userId,
          {
            $inc: { credits: randomReward },
            winCount: 0,
          },
          { new: true }
        );
      }
      
      result = "Congrats! you win.";
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: { winCount: 1 },
        },
        { new: true }
      );
    } else {
      result = "Too bad, you lose.";

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
      randomReward: result === "Congrats! you win." ? randomReward : 0, // reward only on win
      userChoice,
      winCount: updatedUser.winCount,
      credits: updatedUser.credits,
    });
  } catch (error) {
    next(error);
  }
};
