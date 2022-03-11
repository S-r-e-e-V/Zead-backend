const express = require("express");
const { createIPFS } = require("./utils/ipfs");
const mongoose = require("mongoose");
const { nftRoute } = require("./routes");

require("dotenv").config();
const cors = require("cors");

// const scheduler = require("./utils/scheduler");
// const { emailScheduler } = require("./controllers/Schedulers");
// const { OAuth2Client } = require("google-auth-library");

const app = express();

// const uri =
//   "mongodb+srv://Zead:YgUTE7vX7XWdEWnj@cluster0.hhqst.mongodb.net/Zead-NFT?retryWrites=true&w=majority";

// try {
//   mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//   // //Get the default connection
//   var db = mongoose.connection;
//   //Bind connection to error event (to get notification of connection errors)
//   db.on("error", console.error.bind(console, "MongoDB connection error:"));
// } catch (error) {
//   console.log(error);
// }

// cors
// const domainsFromEnv = process.env.CORS_DOMAINS || ""
// const whitelist = domainsFromEnv.split(",").map(item => item.trim())
const whitelist = [
  "http://localhost:3000",
  "https://zead-frontend.herokuapp.com",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use("/nft", nftRoute);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// IPFS
// createIPFS();

// prevent crashing on mongoose error
const connectToDatabase = () => {
  const uri =
    "mongodb+srv://Zead:YgUTE7vX7XWdEWnj@cluster0.hhqst.mongodb.net/Zead-NFT?retryWrites=true&w=majority";
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return mongoose.connection;
};
connectToDatabase()
  .on("error", console.error.bind(console, "MongoDB connection error: "))
  .on("disconnected", connectToDatabase)
  .once("open", () =>
    app.listen(process.env.PORT || 3001, () => {
      console.log("Connected");
    })
  );

// app.listen(process.env.PORT || 3000, () => {
//   console.log("Connected");
// });
