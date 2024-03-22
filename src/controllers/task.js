const { uploadImages, uploadImage } = require("../config/firebase/storage");
const {
  checkIsInAGroup,
  checkIsInAssignerGroup,
} = require("../helpers/inGroup");
const task = require("../models/task");
const User = require("../models/user");
const taskController = {
  getTask: async (req, res) => {
    try {
      const foundTask = await task.findById(req.params.tid);
      if (!foundTask) {
        return res
          .status(404)
          .json({ code: 404, data: "Couldn't find this task!" });
      }

      if (
        foundTask.assignees.includes(req.idDecoded) ||
        foundTask.assigner.equals(req.idDecoded)
      ) {
        const assignerData = await User.findById(foundTask.assigner);

        const assigneesData = await User.find({
          _id: { $in: foundTask.assignees },
        });

        const responseData = {
          task: foundTask,
          assigner: {
            _id: assignerData._id,
            name: assignerData.name,
            photo: assignerData.photo,
          },
          assignees: assigneesData.map((assignee) => ({
            _id: assignee._id,
            name: assignee.name,
            photo: assignee.photo,
          })),
        };

        return res.status(200).json({ code: 200, data: responseData });
      } else {
        return res.status(402).json({
          code: 402,
          data: "You are not authorized to access this task!",
        });
      }
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
  getTaskById: async (req, res) => {
    try {
      const getTask = await task.find({ assignees: { $in: [req.idDecoded] } }).sort({startTime: -1});
      if (!getTask)
        return res
          .status(404)
          .json({ code: 404, data: "User doesn't have any task" });
      return res.status(200).json({ code: 200, data: getTask });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error });
    }
  },
  getTasks: async (req, res) => {
    try {
      let lastDataIndex = parseInt(req.query.lastDataIndex) || 0;
      const limit = 3;

      const query = {
        $or: [
          { assignees: { $in: [req.idDecoded] } },
          { assigner: req.idDecoded },
        ],
      };

      const totalTasks = await task.countDocuments(query);

      if (lastDataIndex >= totalTasks) {
        return res.status(200).json({
          code: 200,
          data: [],
          message: "No more data available",
        });
      }

      const remainingTasks = totalTasks - lastDataIndex;
      console.log(remainingTasks);
      const fetchLimit = Math.min(limit, remainingTasks);
      console.log(fetchLimit);
      const tasks = await task
        .find(query)
        .sort({ startTime: -1 })
        .populate("assigner", "_id name photo")
        .populate("assignees", "_id name photo")
        .skip(lastDataIndex)
        .limit(fetchLimit);
      tasks.map((task) => console.log(task.title));
      if (!tasks || tasks.length === 0) {
        return res.status(404).json({
          code: 404,
          data: [],
          message: "You don't have any task!",
        });
      }

      lastDataIndex += limit;

      return res.status(200).json({
        code: 200,
        data: tasks,
        lastDataIndex,
      });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const checkingAssigner = await checkIsInAGroup(req.idDecoded);
      console.log(checkingAssigner);
      if (!checkingAssigner) {
        return res
          .status(400)
          .json({ code: 400, data: "This user isn't in a group yet" });
      }

      if (!req.body.assignees)
        return res
          .status(400)
          .json({ code: 400, data: "Please choose at least one member" });
      const assignees = req.body.assignees.split(",");
      const promises = assignees.map(async (assignee) => {
        const isInAGroup = await checkIsInAssignerGroup(
          req.idDecoded,
          assignee
        );
        return isInAGroup;
      });

      const checkingAssignees = await Promise.all(promises);
      if (checkingAssignees.includes(false)) {
        return res.status(400).json({
          code: 400,
          data: "There are some people who aren't in this group!",
        });
      }

      const startTime = new Date(req.body.startTime);
      if (startTime.getTime() < Date.now()) {
        return res
          .status(418)
          .json({ code: 418, data: "You cannot pick the time from the past" });
      }

      const endTime = new Date(req.body.endTime);
      if (endTime.getTime() < startTime.getTime()) {
        return res.status(418).json({
          code: 418,
          data: "The end time must be greater than the start time",
        });
      }
      let downloadURLs = [];
      if (req.files) {
        downloadURLs = await uploadImages(req.files);
      }
      console.log(downloadURLs);
      const newTask = await task.create({
        assigner: req.idDecoded,
        assignees: assignees,
        title: req.body.title,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        actualStartTime: req.body.startTime,
        actualEndTime: req.body.endTime,
        description: req.body.description,
        photo: downloadURLs,
      });

      if (newTask) {
        return res
          .status(200)
          .json({ code: 200, data: "Created task successfully" });
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  edit: async (req, res) => {
    console.log(req.body.assignees);
    try {
      const theTask = await task.findById(req.params.tid);

      if (!theTask)
        return res.status(404).json({
          code: 404,
          data: "Cannot find this task, please try again later!",
        });
      console.log(theTask);
      if (req.userData.id != theTask.assigner) {
        return res
          .status(402)
          .json({ code: 402, data: "You're not an assigner in this task" });
      }
      const checkingAssigner = await checkIsInAGroup(req.userData._id);
      if (!checkingAssigner) {
        return res
          .status(400)
          .json({ code: 400, data: "This user isn't in a group yet" });
      }
      const promises = req.body.assignees.map(async (assignee) => {
        const isInAGroup = await checkIsInAssignerGroup(
          req.idDecoded,
          assignee
        );
        return isInAGroup;
      });

      const checkingAssignees = await Promise.all(promises);

      console.log(checkingAssignees);
      if (checkingAssignees.includes(false)) {
        return res.status(400).json({
          code: 400,
          data: "There are some people who aren't in this group!",
        });
      }

      const startTime = new Date(req.body.startTime);
      const endTime = new Date(req.body.endTime);

      if (startTime.getTime() < Date.now()) {
        return res
          .status(418)
          .json({ code: 418, data: "You cannot pick the time from the past" });
      }

      if (endTime.getTime() < startTime.getTime()) {
        return res.status(418).json({
          code: 418,
          data: "The end time must be greater than the start time",
        });
      }

      const updatedTask = await task.findByIdAndUpdate(req.params.tid, {
        assignees: req.body.assignees,
        title: req.body.title,
        startTime: startTime,
        endTime: endTime,
        actualStartTime: startTime,
        actualEndTime: endTime,
        description: req.body.description,
        photo: req.body.photo,
      });

      if (updatedTask) {
        return res
          .status(200)
          .json({ code: 200, data: "Task updated successfully" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ code: 500, data: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const theTask = await task.findById(req.params.tid);
      if (!theTask)
        return res.status(404).json({
          code: 404,
          data: "Cannot find this task, please try again later!",
        });
      if (req.userData.id != theTask.assigner) {
        return res
          .status(402)
          .json({ code: 402, data: "You're not an assigner in this task" });
      }

      await task.findByIdAndDelete(req.params.tid);
      return res
        .status(200)
        .json({ code: 200, data: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ code: 500, data: error.message });
    }
  },

  uploadEditImage: async (req, res) => {
    console.log(req.files.image);
    try {
      if (!req.files)
        return res
          .status(400)
          .json({ code: 400, data: "You need to choose at least an image" });
      let downloadURLs = [];
      if (req.files) {
        downloadURLs = await uploadImages(req.files);
      }

      console.log(downloadURLs);
      return res.status(201).json({ code: 201, data: downloadURLs });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
};

module.exports = taskController;
