const { Thought, User } = require("../models");

const thoughtsController = {
  getAllThought(req, res) {
    Thought.find({})
      .populate({
        path: "reactions",
        select: "-__v",
      })
      .select("-__v")
      .sort({ _id: -1 })
      .then((dbThoughtData) => res.json(dbThoughtData))
      .catch((err) => {
        res.status(400).json(err);
      });
  },
  
  getSingleThought({ params }, res) {
    Thought.findOne({ _id: params.id })
      .populate({
        path: "reactions",
        select: "-__v",
      })
      .select("-__v")
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          res.status(404).json({ message: "No thought found with this id" });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },

  addThought({ body }, res) {
    Thought.create(body)
      .then(({ _id }) => {
        return User.findOneAndUpdate(
          { _id: body.userId },
          { $push: { thoughts: _id } },
          { new: true }
        )
          .populate({
            path: "thoughts",
            select: "-__v",
          })
          .select("-__v");
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: "No user found with this id" });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => res.json(err));
  },

  updateThought({ body, params }, res) {
    Thought.findOneAndUpdate({ _id: params.id }, body, {
      new: true,
      runValidators: true,
    })
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          res.status(404).json({ message: "No thought found with this id" });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch((err) => res.status(400).json(err));
  },

  addReaction({ params, body }, res) {
    Thought.findOneAndUpdate(
      { _id: params.id },
      { $push: { reactions: body } },
      { new: true, runValidators: true }
    )
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          res.status(404).json({ message: "No thought found with this id" });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch((err) => res.json(err));
  },

  removeThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
      .then((deletedThought) => {
        if (!deletedThought) {
          return res
            .status(404)
            .json({ message: "No thought found with this id" });
        }
        return User.findOneAndUpdate(
          { thoughts: { $in: { _id: params.id } } },
          { $pull: { thoughts: params.id } },
          { new: true }
        );
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          res
            .status(404)
            .json({ message: "No user found with this thought id" });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => res.json(err));
  },

  removeReaction({ params }, res) {
    Thought.findOneAndUpdate(
      { _id: params.id },
      { $pull: { reactions: { reactionId: params.reactionId } } },
      { new: true }
    )
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => res.json(err));
  },
};

module.exports = thoughtsController;