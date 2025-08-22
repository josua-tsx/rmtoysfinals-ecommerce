import User from "../models/user.models.js";

export const playRps = async (req, res, next) => {
  const { userChoice } = req.body;
  const userId = req.user.id;

  try {
    const choices = ["rock", "paper", "scissors"];
    const rewards = [5, 0, 25, 1, 50, 2, 100];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    const computerChoice = choices[Math.random(Math.floor() * choices.length)];

    let result;

    if (userChoice === computerChoice) {
      result = "draw";
    } else if (
      (userChoice === "rock" && computerChoice === "scissors") ||
      (userChoice === "scissors" && computerChoice === "paper") ||
      (userChoice === "paper" && computerChoice === "rock")
    ) {
      result = "win";
      await User.findByIdAndUpdate(userId, {
        $inc: { credits: randomReward },
      });
    } else {
      result = "lose";
    }

    res.status(200).json({ result, computerChoice, randomReward, userChoice });
  } catch (error) {
    next(error);
  }
};
