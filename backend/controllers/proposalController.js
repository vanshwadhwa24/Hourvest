const Proposal = require("../models/Proposal");
const User = require("../models/User");

// @desc    Create a new proposal
// @route   POST /api/proposals
// @access  Private
const createProposal = async (req, res) => {
  try {
    const { receiverId, taskDescription, coins } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !taskDescription || !coins) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const proposal = await Proposal.create({
      sender: senderId,
      receiver: receiverId,
      taskDescription,
      coins,
    });

    res.status(201).json(proposal);
  } catch (err) {
    console.error("Error creating proposal:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Accept a proposal
// @route   PATCH /api/proposals/:id/accept
// @access  Private
const acceptProposal = async (req, res) => {
  try {
    console.log("Proposal ID:", req.params.id);
    console.log("User ID from token:", req.user.id);

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    if (proposal.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to accept this proposal' });
    }

    const sender = await User.findById(proposal.sender);
    const receiver = await User.findById(proposal.receiver);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    if (receiver.minits < proposal.coins) {
      return res.status(400).json({ message: 'Receiver does not have enough minits' });
    }

    // Transfer minits
    receiver.minits -= proposal.coins;
    sender.minits += proposal.coins;

    // Mark as accepted
    proposal.status = 'accepted';

    await receiver.save();
    await sender.save();
    await proposal.save();

    res.status(200).json({ message: 'Proposal accepted successfully', proposal });

  } catch (error) {
    console.error("Error in acceptProposal:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// @desc    Reject a proposal
// @route   PATCH /api/proposals/:id/reject
// @access  Private
const rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    if (proposal.receiver.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this proposal" });
    }

    proposal.status = "rejected";
    await proposal.save();

    res.status(200).json(proposal);
  } catch (err) {
    console.error("Error rejecting proposal:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Get all proposals for the logged-in user
// 4. Get all proposals for the logged-in user
const getProposalsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const proposals = await Proposal.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "username")
      .populate("receiver", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(proposals);
  } catch (err) {
    console.error("Error fetching proposals:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Export
module.exports = {
  createProposal,
  acceptProposal,
  rejectProposal,
  getProposalsForUser,
};
