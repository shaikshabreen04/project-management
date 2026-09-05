import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';


// CREATE TASK
export async function createTask(data, userId) {

    const project = await Project.findById(data.projectId);

    if (!project) {
        throw new Error('Project does not exist');
    }

    const user = await User.findById(data.userId);

    if (!user) {
        throw new Error('User does not exist');
    }

    return await Task.create({
        ...data,
        createdBy: userId,
        updatedBy: userId
    });
}


// GET ALL TASKS
export async function getAllTasks() {

    return await Task.find()
        .populate('projectId')
        .populate('userId', '-password')
        .populate('createdBy', '-password')
        .populate('updatedBy', '-password');
}


// GET TASK BY ID
export async function getTaskById(id) {

    return await Task.findById(id)
        .populate('projectId')
        .populate('userId', '-password')
        .populate('createdBy', '-password')
        .populate('updatedBy', '-password');
}


// UPDATE TASK
export async function updateTask(id, data, userId) {

    if (data.projectId) {

        const project = await Project.findById(data.projectId);

        if (!project) {
            throw new Error('Project does not exist');
        }
    }


    if (data.userId) {

        const user = await User.findById(data.userId);

        if (!user) {
            throw new Error('User does not exist');
        }
    }


    return await Task.findByIdAndUpdate(
        id,
        {
            ...data,
            updatedBy: userId
        },
        {
            new: true,
            runValidators: true
        }
    );
}


// DELETE TASK
export async function deleteTask(id) {

    return await Task.findByIdAndDelete(id);
}