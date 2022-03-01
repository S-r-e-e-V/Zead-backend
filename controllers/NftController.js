const mongoose = require("mongoose");

const User = require("../modals/User");
const Content = require("../modals/Content");
const Sales = require("../modals/Sales");
const Bidding = require("../modals/Bidding");
const Notification = require("../modals/Notification");
const TTL = require("../modals/TTL");

const { uploadFile } = require("../utils/s3");
const { addDataToIPFS, getDataFromIPFS } = require("../utils/ipfs");

// post methods

// add new user
const addUser = async (req, res, next) => {
  try {
    // add image to s3 and place url
    const user = new User({
      username: `username-${req.body.wallet_address}`,
      // bio: req.body.bio,
      // email: req.body.email,
      wallet_address: req.body.wallet_address,
      // website: req.body.website,
      // twitter_handle: req.body.twitter_handle,
      // instagram_handle: req.body.instagram_handle,
    });
    const response = await user.save();
    res
      .status(200)
      .json({ message: "Successfully added", user_id: response._id });
  } catch (error) {
    if (error.code === 11000) {
      try {
        const response = await User.findOne(
          {
            wallet_address: req.body.wallet_address,
          },
          { _id: 1 }
        );
        if (response)
          res
            .status(200)
            .json({ message: "User already exist", user_id: response });
        else
          res.status(400).json({ error: { message: "Something went wrong" } });
      } catch (error) {
        error.status = 400;
        next(error);
      }
    } else {
      error.status = 400;
      next(error);
    }
  }
};
const uploadProfilePic = async (req, res, next) => {
  const profile_image = req.file;
  console.log(profile_image);
  const s3_result = await uploadFile(
    profile_image,
    "application-images/" + Date.now() + "_" + profile_image.originalname,
    true
  );
  try {
    const response = await User.updateOne(
      { _id: req.params.id },
      { profile_image: s3_result.Location }
    );
    if (response) res.status(200).json(response);
    else res.status(400).json({ error: { message: "Failed" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
const uploadProfileBanner = async (req, res, next) => {
  const profile_banner = req.file;
  console.log(profile_banner);
  const s3_result = await uploadFile(
    profile_banner,
    "application-images/" + Date.now() + "_" + profile_banner.originalname,
    true
  );
  try {
    const response = await User.updateOne(
      { _id: req.params.id },
      { profile_banner: s3_result.Location }
    );
    if (response) res.status(200).json(response);
    else res.status(400).json({ error: { message: "Failed" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// add new content
// add notification to followers
const addContent = async (req, res, next) => {
  try {
    // add image to ipfs and place hash
    const ipfs_hash = "hash#hash#hash@hash";
    const content_url = req.body.content;

    const content = new Content({
      content_url: content_url,
      name: req.body.name,
      description: req.body.description,
      current_owner: req.body.owner_id,
      original_owner: req.body.owner_id,
      expiry_date: req.body.type === "bid" ? req.body.expiry_date : null,
      hash: ipfs_hash,
      type: req.body.type,
      price: req.body.price,
    });
    const response = await content.save();
    if (req.body.type === "bid" && response) {
      try {
        const bidding = new Bidding({
          owner_id: req.body.owner_id,
          content_id: response?._id,
        });
        const bidding_response = await bidding.save();
        const ttl = new TTL({
          expireAt: new Date(req.body.expiry_date),
          owner_id: req.body.owner_id,
          content_id: response?._id,
          bidding_id: bidding_response?._id,
        });
        await ttl.save();
      } catch (error) {
        error.status = 400;
        next(error);
      }
    }
    res.status(200).json({ message: "Successfully added" });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
const addIPFS = async (req, res, next) => {
  try {
    // const cid = await addDataToIPFS(req.file);
    const data = await getDataFromIPFS(
      "QmZf5PKAh9QbxL8v66mbpmSvYZNXnHuqWTsGEGffHV17W9"
    );
    res.status(200).json({ cid: data });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// add favor\ite_content
const favoriteContent = async (req, res, next) => {
  try {
    const response = await User.updateOne(
      { _id: req.params.id },
      {
        $push: { favourite_content: { content_id: response?.current_owner } },
      }
    );

    if (response) res.status(200).json(response);
    else res.status(400).json({ error: { message: "Data not found" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// on normal sales happens
// add notification to seller
const addSales = async (req, res, next) => {
  try {
    const response = await Content.findOne({ _id: req.body.content_id });
    if (response) {
      const updateContent = await Content.updateOne(
        { _id: req.body.content_id },
        {
          $push: { previous_owners: { user_id: response?.current_owner } },
          current_owner: req.body.buyer_id,
        }
      );
      const sales = new Sales({
        seller_id: response?.current_owner,
        buyer_id: req.body.buyer_id,
        content_id: response?._id,
        price: response?.price,
      });
      const buyer = await User.findOne({ _id: req.body.buyer_id });
      const notification = new Notification({
        message: "Content sold",
        description: `${response?.name} sold at ${response?.price} to ${buyer?.username}`,
        send_to: [response?.current_owner],
      });
      await notification.save();
      const sales_response = await sales.save();
      if (sales_response && updateContent)
        res.status(200).json({ message: "Successfull" });
    } else res.status(400).json({ error: { message: "Data not found" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// trigger new bidding
// add notification to seller
const addNewBid = async (req, res, next) => {
  try {
    const contentResponse = await Content.findOne({ _id: req.body.content_id });
    if (contentResponse && contentResponse.expiry_date < new Date()) {
      const response = await Bidding.updateOne(
        { _id: req.body.id },
        {
          $push: {
            bidders: { user_id: req.body.user_id, price: req.body.price },
          },
        }
      );
      if (response) {
        res.status(200).json({ message: "Bid Created" });
      } else res.status(400).json({ error: { message: "Data not found" } });
    } else {
      res.status(400).json({ error: { message: "Sorry bidding expired" } });
    }
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// when a user follow
//  add notification to follower
const addFollowers = async (req, res, next) => {
  // follower_id: person who follow
  // following_id: following celebrity
  try {
    const follower = await User.updateOne(
      { _id: req.body.follower_id },
      {
        $push: {
          following: { user_id: req.body.following_id },
        },
      }
    );
    const following = await User.updateOne(
      { _id: req.body.following_id },
      {
        $push: {
          followers: { user_id: req.body.follower_id },
        },
      }
    );
    if (follower && following) {
      res.status(200).json({ message: "Successfull" });
    }
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// get methods

// get all users for testing purpose move to admin area later
const getAllUsers = async (req, res, next) => {
  // var date = new Date();
  // var today = new Date(date.toDateString());
  // var startDate = new Date(date.setMonth(today.getMonth() - 3));
  try {
    const response = await User
      .find
      // {
      // $and: [
      // { user_id: req.user.id },
      // {
      //   date: {
      //     $gte: req.body.startTime ?? new Date(startDate.toDateString()),
      //     $lte: req.body.endTime ?? today,
      //   },
      // },
      // ],
      // },
      // { date: 1, content: 1 },
      // { skip: req.body.offSet, limit: req.body.limit }
      ()
      .sort({ createdAt: -1 });
    res.status(200).json({ count: response.length, list: response });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// get all content
// const getAllContent = async (req, res, next) => {
//   // return content exxcept the given user_id
//   try {
//     const response = await Diary.find().sort({ createdAt: -1 });
//     res.status(200).json({ count: response.length, list: response });
//   } catch (error) {
//     error.status = 400;
//     next(error);
//   }
// };
// get single user
const getUser = async (req, res, next) => {
  try {
    const response = await User.findOne({ _id: req.params.id });
    if (response) res.status(200).json(response);
    else res.status(400).json({ error: { message: "Data not found" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// get single content
const getContent = async (req, res, next) => {
  try {
    const response = await Content.findOne({ _id: req.params.id });
    if (response) res.status(200).json(response);
    else res.status(400).json({ error: { message: "Data not found" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// get notification of a user
const getNotification = async (req, res, next) => {
  try {
    const response = await Notification.aggregate([
      { $unwind: "$send_to" },
      {
        $match: {
          send_to: mongoose.Types.ObjectId(req.params.id),
        },
      },
    ]);
    if (response) res.status(200).json(response);
    else res.status(400).json({ error: { message: "Data not found" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

module.exports = {
  addUser,
  uploadProfilePic,
  uploadProfileBanner,
  addContent,
  favoriteContent,

  addIPFS,

  addSales,
  addNewBid,
  addFollowers,

  getAllUsers,
  // getAllContent,
  getUser,
  getContent,
  getNotification,
};
