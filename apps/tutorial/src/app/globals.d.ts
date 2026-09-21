declare interface AppEventMap {
    // Add app-specific event types here
    // 'event': { /* payload? */ }
    'task-event': { taskId: number };
};

declare interface ITask {
    id: number;
    name: string;
    content?: string;
}