declare interface AppEventMap {
    // Add app-specific event types here
    // 'task-saved': { taskId: number };  // emit('task-saved', { taskId }) — payload required
    // 'tasks-cleared': undefined;        // emit('tasks-cleared') — no payload
    'task-event': { taskId: number };
};

declare interface ITask {
    id: number;
    name: string;
    content?: string;
}