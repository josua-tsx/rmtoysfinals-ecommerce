import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";

// export const playRps = async (req, res, next) => {
//   const { userChoice } = req.body;
//   const userId = req.user.id;

//   if (!userId) return next(handleMakeError(400, "User not found!"));

//   try {
//     const currentUser = await User.findById(userId).select("winCount");

//     if (currentUser.playLock && currentUser.playLock > new Date()) {
//       return next(handleMakeError(429, "Please wait before playing again"));
//     }

//     const choices = ["rock", "paper", "scissors"];
//     const rewards = [5, 0, 10, 1, 20, 2];
//     const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
//     const computerChoice = choices[Math.floor(Math.random() * choices.length)];

//     // ADDED A CUSTOM DELAY FOR UI
//     await new Promise((resolve) => setTimeout(resolve, 1200));

//     let result;
//     if (userChoice === computerChoice) {
//       result = "Boring... it's a draw.";
//     } else if (
//       (userChoice === "rock" && computerChoice === "scissors") ||
//       (userChoice === "scissors" && computerChoice === "paper") ||
//       (userChoice === "paper" && computerChoice === "rock")
//     ) {
//       if (currentUser.winCount === 3) {
//         await User.findByIdAndUpdate(
//           userId,
//           {
//             $inc: { credits: randomReward },
//             winCount: 0,
//           },
//           { new: true }
//         );

//         return next(
//           handleMakeError(
//             400,
//             `Congratulations, you got ${randomReward} credits! try again tommorow!`
//           )
//         );
//       }

//       result = "Congrats! you win.";
//       await User.findByIdAndUpdate(
//         userId,
//         {
//           $inc: { winCount: 1 },
//           $set: { playLock: new Date(Date.now() + 24 * 60 * 60 * 1000) },
//         },
//         { new: true }
//       );
//     } else {
//       result = "Too bad, you lose.";

//       if (currentUser.winCount > 0) {
//         await User.findByIdAndUpdate(
//           userId,
//           {
//             $inc: { winCount: -1 },
//           },
//           { new: true }
//         );
//       }
//     }

//     const updatedUser = await User.findById(userId).select("credits winCount");

//     res.status(200).json({
//       result,
//       computerChoice,
//       randomReward: result === "Congrats! you win." ? randomReward : 0, // reward only on win
//       userChoice,
//       winCount: updatedUser.winCount,
//       credits: updatedUser.credits,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const playRps = async (req, res, next) => {
  const { userChoice } = req.body;
  const userId = req.user.id;

  if (!userId) return next(handleMakeError(400, "User not found!"));

  try {
    // Check if user is locked out first
    const currentUser = await User.findById(userId).select(
      "winCount playLock credits"
    );

    if (currentUser.playLock && currentUser.playLock > new Date()) {
      return next(handleMakeError(429, "Please wait before playing again"));
    }

    const choices = ["rock", "paper", "scissors"];
    const rewards = [5, 0, 10, 2, 15, 20, 3];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    await new Promise((resolve) => setTimeout(resolve, 1200));

    let result;
    let rewardEarned = 0;
    let newWinCount = currentUser.winCount;

    if (userChoice === computerChoice) {
      result = "Boring... it's a draw.";
    } else if (
      (userChoice === "rock" && computerChoice === "scissors") ||
      (userChoice === "scissors" && computerChoice === "paper") ||
      (userChoice === "paper" && computerChoice === "rock")
    ) {
      newWinCount += 1;

      if (newWinCount >= 3) {
        // Changed to >= 3 to handle edge cases
        rewardEarned = randomReward;
        result = `Congratulations! You won ${randomReward} credits!`;
        newWinCount = 0;
      } else {
        result = "Congrats! you win.";
      }

      // Set playLock only when reward is given
      const updateData = {
        $inc: { winCount: 1, credits: rewardEarned },
        ...(rewardEarned > 0 && {
          $set: { playLock: new Date(Date.now() + 30 * 1000) },
        }),
      };

      await User.findByIdAndUpdate(userId, updateData);
    } else {
      result = "Too bad, you lose.";
      newWinCount = Math.max(0, currentUser.winCount - 1);
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
      lockedUntil: updatedUser.playLock, // Frontend can show countdown
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

    // Check if playLock exists and is a valid date
    if (!currentUser.playLock || new Date(currentUser.playLock) <= now) {
      await User.findByIdAndUpdate(
        userId,
        {
          $set: { playLock: null },
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Lock reset successfully", unlocked: true });
    } else {
      const lockExpiry = new Date(currentUser.playLock);
      const expiryDate = lockExpiry.toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return res.status(200).json({ lockedUntil: expiryDate });
    }
  } catch (error) {
    next(error);
  }
};
