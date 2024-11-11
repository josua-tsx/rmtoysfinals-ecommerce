import { handleMakeError } from "../middleware/handleError.js";
import User from "../models/user.models.js";
import bcypt from "bcryptjs";
import { generateTokens } from "../utils/generateToken.js";

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
    const users = await User.find().populate({
      path: "address",
      select: "fullAddress isActive"

    })
    res.status(201).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllCustomer = async (req, res, next) => {
  try {
    const findAllCustomer = await User.find({role: "customer"}).populate({
      path: "address",
      select: "fullAddress isActive"
    })
    if (!findAllCustomer) return next(handleMakeError(400, "Not found!"))
    res.status(200).json(findAllCustomer)
  } catch (error) {
    next(error)
  }
}


export const getAllWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: { $ne: "customer" }, _id: {$ne: "66f11dabdd976c6253f3f24c"} }).populate({
      path: "address",
      select: "fullAddress isActive"
    });

    // Check if no workers were found
    if (workers.length === 0) {
      return res.json([]);
    }

    res.status(200).json(workers);
  } catch (error) {
    next(error);
  }
};


export const deleteWorker = async (req, res, next) => {

  const {workerId} = req.params

  try {
    const worker = await User.findById(workerId)

    if (!worker) return next(handleMakeError(400, "worker not found!"));

    await User.findByIdAndDelete(workerId)
    res.status(200).json({ message: "Worker Deleted" });
  } catch (error) {
    next(error)
  }
}

export const getSingleUser = async (req, res, next) => {

  const {userId} = req.params

  try {

    const singleUser = await User.findById(userId).populate({
      path: "address",
      select: "fullAddress isActive"
    })

    if(!singleUser) return next(handleMakeError(400, "no user found!"))

    res.status(200).json(singleUser)

    
  } catch (error) {
    next(error)
  }
}