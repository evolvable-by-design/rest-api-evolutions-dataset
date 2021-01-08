const uuid = require('uuid/v4');

const { Task, TaskStatus } = require('../models/Task');
const Errors = require('../utils/errors');

class TaskService {

  constructor() {
    this.tasks = [];
  }

  list(projectId, createdBefore, offset, limit) {
    return this.listAll(projectId, createdBefore).slice(offset, offset + limit);
  }

  listAll(projectId, createdBefore) {
    return this.tasks.filter(task => 
      task.projectId === projectId
      && (!createdBefore || task.creationDate < createdBefore)
    );
  }
 
  findById(taskId) {
    return this.tasks.find(task => task.id === taskId);
  }

  findByIdOrFail(taskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task) {
      return task;
    } else {
      throw new Errors.NotFound();
    }
  }

  tasksCount(projectId, createdBefore) {
    return this.listAll(projectId, createdBefore).length;
  }

  delete(taskId) {
    const task = this.findByIdOrFail(taskId);
    if (task) {
      this.tasks.splice(this.tasks.indexOf(task), 1);
    } else {
      throw new Errors.BusinessRuleEnforced();
    }
  }

  createTechnicalStory({ title, description, assignee, status, tags, priority }, projectId) {
    const createdTask = Task.ofTechnicalStory(uuid(), projectId, title, description, assignee, new Date(Date.now()), status || TaskStatus.todo, tags, priority);
    this.tasks.push(createdTask);
    return createdTask;
  }

  createUserStory({ title, description, assignee, status, points, tags, priority }, projectId) {
    const createdTask = Task.ofUserStory(uuid(), projectId, title, description, assignee, new Date(Date.now()), points, status || TaskStatus.todo, tags, priority);
    this.tasks.push(createdTask);
    return createdTask;
  }

  updateTask(taskId, { title, description, assignee, status, points, tags, priority }) {
    const task = this.findByIdOrFail(taskId);
    if (title) { task.title = title; }
    if (description) { task.description = description; }
    if (assignee) { task.assignee = assignee; }
    if (status) { task.status = status; }
    if (points && task.isUserStory()) { task.points = points; }
    if (tags) { task.tags = tags }
    if (priority) { task.priority = priority }

    if (title || description || assignee || status || points || tags || priorty) { task._onUpdate(); }
  }

  updateStatus(taskId, status) {
    const task = this.findByIdOrFail(taskId);
    task.status = status;
    task._onUpdate();
  }

}

module.exports = new TaskService();
