require("dotenv").config();
const express = require("express");
const app = express();
const { Schema, model, default: mongoose } = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const BotUser = model(
  "BotUser",
  new Schema({
    chatId: String,
    userId: String,
    username: String,
    name: String,
    referralsCount: Number,
    balance: Number,
    walletAddress: String,
    referralLink: String,
    ipAddress: String,
  })
);

// Parse URL-encoded bodies (deprecated in Express v4.16+)
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies
app.use(express.json());
app.options("*", cors()); // Enable preflight OPTIONS request for all routes

app.use(cors({
    origin: '*'
  }));

app.get("/", (req, res)=>{
    res.send("Referral hello World")
})


//Endpoint for referral link
app.post("/referUser/:referralLink", async (req, res) => {
    const referralLink = req.params.referralLink;
    if (!referralLink) {
      res.status(404).json({
        success: true,
        message:
          "This link does not exist. Please ask its owner to send you a valid link.",
      });
    }
  
    const linkFirstChunk = "tonidentity.com/refer?inviteId="
    const givenReferralLink = linkFirstChunk+referralLink
  
    try {
      const linkOwner = await BotUser.findOne({ referralLink:givenReferralLink });
  
      if (linkOwner) {
        //Update balance
        const newBalance = linkOwner.balance + 25;
        linkOwner.balance = newBalance;
  
        //Update referral count
        const newReferralsCount = linkOwner.referralsCount + 1;
        linkOwner.referralsCount = newReferralsCount;
  
        //Save updates
        await linkOwner.save();
        res.status(200).json({
          success: true,
          data: { name: linkOwner.name, username: linkOwner.username },
        });
      } else {
        res.status(404).json({
          success: true,
          message:
            "This link does not exist. Please ask its owner to send you a valid link.",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occured. Please reload and try again.",
      });
    }
  });
  
  const port = process.env.PORT || 5000
  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
  
  mongoose
    .connect(process.env.URI)
    .then(() => console.log("Connected to db."))
    .catch((err) => {
      console.log(`Error connecting to db: ${err}`);
    });
