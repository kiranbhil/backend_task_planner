const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    assignedBy: {
        type: String,
        require: true,
    },
    assignedTo: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        require: true,
    },
    title: {
        type: String,
        require: true,
    },
    sprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sprint",
        required: true,
    }

});


const taskModel = mongoose.model("task", taskSchema);

module.exports = taskModel;