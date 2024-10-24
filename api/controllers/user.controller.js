import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";
import bcypt from "bcryptjs";

export const updateProfile = async (req, res, next) => {
  const id = req.params.id;

  try {
    const { username, email, password, avatar, phoneNumber } = req.body;

    let hashedPassword;
    if (password) {
     hashedPassword = await bcypt.hash(password, 10);
    }

    const currentUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          username,
          email,
          password: hashedPassword,
          avatar,
          phoneNumber,
        },
      },
      { new: true }
    ).select("-password")

    res.status(201).json(currentUser);
  } catch (error) {
    next(error);
    console.log("error in update profile controller");
  }
};

export const getAll = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(201).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllCustomer = async (req, res, next) => {
  try {
    const findAllCustomer = await User.find({role: "customer"})
    if (!findAllCustomer) return next(handleMakeError(400, "Not found!"))
    res.status(200).json(findAllCustomer)
  } catch (error) {
    next(error)
  }
}

// export const getAllWorkers = async (req, res, next) => {
//   try {
//     const dontFindCustomer = await User.find({role: {$ne: "customer"}})
//     if (!dontFindCustomer) return next(handleMakeError(400, "Not found!"))
//     res.status(200).json(dontFindCustomer)
//   } catch (error) {
//     next(error)
//   }
// }
