import { handleMakeError } from "../middleware/handleError.js";
import Address from "../models/address.models.js";
import User from "../models/user.models.js";

export const addAddress = async (req, res, next) => {
  const userId = req.user.id;

  const {
    country,
    region,
    stateProvince,
    city,
    barangay,
    streetBuildingHouseNum,
  } = req.body;

  // Validate required fields
  if (
    !region ||
    !stateProvince ||
    !city ||
    !barangay ||
    !streetBuildingHouseNum
  ) {
    return next(handleMakeError(400, "Please input required fields!"));
  }

  try {
    // Construct full address string
    const fullAddress =
      `${streetBuildingHouseNum.trim()}, ${barangay.trim()}, ${city.trim()}`.trim();

    // Check if the address already exists for this user
    const existingAddress = await Address.findOne({
      userId,
      fullAddress
    });

    if (existingAddress) {
      return next(
        handleMakeError(400, "This address is already in your list!")
      );
    }

    // Check if the user already has 3 addresses
    const userAddresses = await Address.find({ userId });
    if (userAddresses.length >= 3) {
      return next(handleMakeError(400, "You can only have 3 addresses!"));
    }

    // Create the new address
    const newAddress = new Address({
      country,
      region,
      stateProvince,
      city,
      barangay,
      streetBuildingHouseNum,
      fullAddress,
      userId,
    });

    // Save the new address to the Address collection
    const savedAddress = await newAddress.save();

    // Add the new address ID to the user's address array
    await User.findByIdAndUpdate(userId, {
      $push: { address: savedAddress._id },
    });

    // Return the saved address as the response
    res.status(201).json(savedAddress);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

export const getAllAddress = async (req, res, next) => {
  try {
    const findAllAddress = await Address.find();

    if (!findAllAddress) return next(handleMakeError(400, "No Address found!"));

    res.status(200).json(findAllAddress);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  const { addressId } = req.params;

  try {
    const addressDelete = await Address.findById(addressId);

    if (!addressDelete) return next(handleMakeError(400, "Address not found!"));

    await Address.findByIdAndDelete(addressId);

    res.status(200).json({ message: "Address Sucessfully Deleted!" });
  } catch (error) {
    next(error);
  }
};

export const editAddress = async (req, res, next) => {
  const { addressId } = req.params;

  const {
    country,
    region,
    stateProvince,
    city,
    barangay,
    fullAddress,
    streetBuildingHouseNum,
  } = req.body;

  try {
    const existingAddress = await Address.findOne({ fullAddress });

    if (existingAddress)
      return next(handleMakeError(400, "This Address already in the list!"));

    const updateAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        country,
        region,
        stateProvince,
        city,
        barangay,
        fullAddress: `${streetBuildingHouseNum}, ${barangay}, ${city}`,
        streetBuildingHouseNum,
      },
      {
        new: true,
      }
    );

    if (!updateAddress) return next(handleMakeError(400, "Address not found!"));

    res.status(200).json(updateAddress);
  } catch (error) {
    next(error);
  }
};

export const getAddress = async (req, res, next) => {
  const { addressId } = req.params;

  try {
    const getAddress = await Address.findById(addressId);
    if (!getAddress) return next(handleMakeError(400, "Address not found!"));
    res.status(200).json(getAddress);
  } catch (error) {
    next(error);
  }
};

export const getUserAddress = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const getUserAddress = await User.findById(userId);
    if (!getUserAddress) return next(handleMakeError(400, "No user found!"));

    // Retrieve addresses for the specified user
    const addresses = await Address.find({ userId }); // Assuming addresses are linked to user by userId
    // Return the addresses
    return res.status(200).json(addresses);
  } catch (error) {
    next(error);
  }
};

export const updateAddressTrue = async (req, res, next) => {
  const userId = req.user.id;
  const { addressId } = req.body;

  try {
    await Address.updateMany({ userId, isActive: true }, { isActive: false });

    const updateIsActive = await Address.findByIdAndUpdate(
      addressId,
      {
        isActive: true,
      },
      { new: true }
    );

    if (!updateIsActive)
      return next(handleMakeError(400, "Address not found!"));

    res
      .status(200)
      .json({ message: "sucessfully updated the address" }, updateIsActive);
  } catch (error) {
    next(error);
  }
};

export const getActiveAddress = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const findActiveAddress = await Address.findOne({ userId, isActive: true });

    res.status(200).json(findActiveAddress);
  } catch (error) {
    next(error);
  }
};
