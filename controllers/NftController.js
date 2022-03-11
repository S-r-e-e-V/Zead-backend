const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../modals/User");
const Content = require("../modals/Content");
const Sales = require("../modals/Sales");
const Bidding = require("../modals/Bidding");
const Notification = require("../modals/Notification");
const Collection = require("../modals/Collection");
const TTL = require("../modals/TTL");

const { addDataToIPFS, getDataFromIPFS } = require("../utils/ipfs");

// profile

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
    if (response) {
      let token = jwt.sign(
        { wallet_address: req.body.wallet_address, user_id: response._id },
        process.env.JWT_KEY
        // { expiresIn: "7d" }
      );
      res.status(200).json({ message: "Successfully added", token });
    }
  } catch (error) {
    if (error.code === 11000) {
      try {
        const response = await User.findOne(
          {
            wallet_address: req.body.wallet_address,
          },
          { _id: 1 }
        );
        if (response) {
          let token = jwt.sign(
            { wallet_address: req.body.wallet_address, user_id: response._id },
            process.env.JWT_KEY
            // { expiresIn: "7d" }
          );
          res.status(200).json({ message: "User already exist", token });
        } else
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
const editUser = async (req, res, next) => {
  try {
    // add image to s3 and place url
    const response = await User.updateOne(
      {
        _id: req.user.user_id,
      },
      {
        username: req.body.username,
        bio: req.body.bio,
        email: req.body.email,
        website: req.body.website,
        twitter_handle: req.body.twitter_handle,
        instagram_handle: req.body.instagram_handle,
        discord_handle: req.body.discord_handle,
        profile_image: req.body.profile_image,
        profile_banner: req.body.profile_banner,
      }
    );
    if (response?.modifiedCount > 0)
      res.status(200).json({ message: "Successfully updated" });
    else res.status(400).json({ error: { message: "Not able to update" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// when a user follow
const addFollowers = async (req, res, next) => {
  // follower_id: person who follow
  // following_id: following celebrity
  try {
    const follower = await User.findOneAndUpdate(
      { _id: req.user.user_id },
      {
        $push: {
          following: req.body.following_id,
        },
      }
    );
    const following = await User.updateOne(
      { _id: req.body.following_id },
      {
        $push: {
          followers: req.user.user_id,
        },
      }
    );
    const notification = new Notification({
      message: "New follower",
      description: `${follower?.username} started following`,
      send_to: [req.body.following_id],
    });
    await notification.save();
    if (follower && following) {
      res.status(200).json({ message: "Successfull" });
    } else {
      res.status(400).json({ error: { message: "Something went wrong" } });
    }
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// add favorite_content
const favoriteContent = async (req, res, next) => {
  try {
    const response = await User.updateOne(
      { _id: req.user.user_id },
      {
        $push: { favourite_content: req.body.content_id },
      }
    );

    if (response) res.status(200).json({ message: "Added to favorites" });
    else res.status(400).json({ error: { message: "Data not found" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// content

// add new content
const addContent = async (req, res, next) => {
  try {
    if (req.body.supply <= 100 && req.body.supply > 0) {
      // add image to ipfs and place hash
      let collection_id = "";
      let items_array = [];
      if (req.body.collection_id) {
        collection_id = req.body.collection_id;
      } else {
        const collection_response = await new Collection({
          original_owner: req.user.user_id,
        }).save();
        collection_id = collection_response._id;
        await Collection.updateOne(
          { _id: collection_id },
          { name: collection_id }
        );
      }
      let content;

      for (let i = 0; i < req.body.supply; i++) {
        content = new Content({
          original_owner: req.user.user_id,
          ipfs_hash: req.body.ipfs_hash,
          content_type: req.body.content_type,
          blockchain_type: req.body.blockchain_type,
          freeze: req.body.freeze,
          current_owner: req.user.user_id,
          collection_id: collection_id,
          name: req.body.name,
          description: req.body.description,
          external_link: req.body.external_link,
          properties: req.body.properties,
          levels: req.body.levels,
          stats: req.body.stats,
          unlockable_content: req.body.unlockable_content,
          is_sensitive: req.body.is_sensitive,
          supply_number: i + 1,
        });
        items_array.push(content);
      }
      // const response = await content.save();
      const response = await Content.insertMany(items_array);
      // if (req.body.type === "bid" && response) {
      //   try {
      //     const bidding = new Bidding({
      //       owner_id: req.body.owner_id,
      //       content_id: response?._id,
      //     });
      //     const bidding_response = await bidding.save();
      //     const ttl = new TTL({
      //       expireAt: new Date(req.body.expiry_date),
      //       owner_id: req.body.owner_id,
      //       content_id: response?._id,
      //       bidding_id: bidding_response?._id,
      //     });
      //     await ttl.save();
      //   } catch (error) {
      //     error.status = 400;
      //     next(error);
      //   }
      // }
      if (response) res.status(200).json({ message: "Successfully added" });
      else res.status(400).json({ error: { message: "Something went wrong" } });
    } else {
      res.stats(400).json({
        error: { message: "Supply shoould be between 1 and 100 (inclusive)" },
      });
    }
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// edit content
const editContent = async (req, res, next) => {
  try {
    let collection_id = "";
    if (req.body.collection_id) {
      collection_id = req.body.collection_id;
    } else {
      const collection_response = await new Collection({
        original_owner: req.user.user_id,
      }).save();
      collection_id = collection_response._id;
      await Collection.updateOne(
        { _id: collection_id },
        { name: collection_id }
      );
    }
    const response = await Content.updateMany(
      {
        ipfs_hash: req.body.ipfs_hash,
        current_owner: req.user.user_id,
        is_deleted: false,
      },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          external_link: req.body.external_link,
          collection_id: collection_id,
          properties: req.body.properties,
          levels: req.body.levels,
          stats: req.body.stats,
          unlockable_content: req.body.unlockable_content,
          is_sensitive: req.body.is_sensitive,
        },
      }
    );
    if (response?.modifiedCount > 0)
      res.status(200).json({ message: "Successfully updated" });
    else res.status(400).json({ error: { message: "Not able to update" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// // get all contents in a collection
// const getAllCollectionContents = async (req, res, next) => {
//   try {
//     const response = await Content.find({
//       original_owner: req.params.id,
//     }).sort({
//       createdAt: -1,
//     });
//     if (response)
//       res.status(200).json({ count: response.length, list: response });
//     else res.status(400).json({ error: { message: "Something went wrong" } });
//   } catch (error) {
//     error.status = 400;
//     next(error);
//   }
// };
// // get single content
// const getContent = async (req, res, next) => {
//   try {
//     const response = await Content.findOne({ _id: req.params.id });
//     if (response) res.status(200).json(response);
//     else res.status(400).json({ error: { message: "Data not found" } });
//   } catch (error) {
//     error.status = 400;
//     next(error);
//   }
// };

// collection

// add new Collection
const addCollection = async (req, res, next) => {
  try {
    const collection = new Collection({
      name: req.body.name,
      url: req.body.url,
      description: req.body.description,
      logo_image: req.body.logo_image,
      featured_image: req.body.featured_image,
      banner_image: req.body.banner_image,
      category: req.body.category,
      website: req.body.website,
      twitter_handle: req.body.twitter_handle,
      instagram_handle: req.body.instagram_handle,
      discord_handle: req.body.discord_handle,
      medium: req.body.medium,
      blockchain_type: req.body.blockchain_type,
      is_sensitive: req.body.is_sensitive,
      original_owner: req.user.user_id,
    });
    const response = await collection.save();
    if (response) res.status(200).json({ message: "Successfully added" });
    else res.status(400).json({ error: { message: "Something went wrong" } });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: { message: "Name already taken" } });
    } else {
      error.status = 400;
      next(error);
    }
  }
};
// edit collection
const editCollection = async (req, res, next) => {
  try {
    // add image to s3 and place url
    const response = await Collection.updateOne(
      {
        _id: req.body.collection_id,
      },
      {
        name: req.body.name,
        url: req.body.url,
        description: req.body.description,
        logo_image: req.body.logo_image,
        featured_image: req.body.featured_image,
        banner_image: req.body.banner_image,
        category: req.body.category,
        website: req.body.website,
        twitter_handle: req.body.twitter_handle,
        instagram_handle: req.body.instagram_handle,
        discord_handle: req.body.discord_handle,
        medium: req.body.medium,
        blockchain_type: req.body.blockchain_type,
        is_sensitive: req.body.is_sensitive,
      }
    );
    if (response?.modifiedCount > 0)
      res.status(200).json({ message: "Successfully updated" });
    else res.status(400).json({ error: { message: "Not able to update" } });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: { message: "Name already taken" } });
    } else {
      error.status = 400;
      next(error);
    }
  }
};
// get all collections of a perticular user
const getAllUserCollections = async (req, res, next) => {
  try {
    const response = await Collection.find({
      original_owner: req.params.id,
    }).sort({
      createdAt: -1,
    });
    if (response)
      res.status(200).json({ count: response.length, list: response });
    else res.status(400).json({ error: { message: "Something went wrong" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
// get individual collections
const getCollection = async (req, res, next) => {
  try {
    const response = await Collection.findOne({
      _id: req.params.id,
    });
    if (response) res.status(200).json(response);
    else res.status(400).json({ error: { message: "Something went wrong" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
//

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
  // profile
  addUser,
  editUser,
  addFollowers,
  favoriteContent,
  getUser,

  // content
  addContent,
  editContent,
  // getAllCollectionContents,
  // getContent,

  // collections
  addCollection,
  editCollection,
  getAllUserCollections,
  getCollection,

  addIPFS,

  addSales,
  addNewBid,

  getAllUsers,
  // getAllContent,
  getNotification,
};
