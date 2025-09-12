import { snippetsManager } from '../../../../../helpers/index.js';
import taskService from './task-service.json' with { type: "json" };

const persistentDataLocalizedSnippets: LocalizedSnippet[] = [];

persistentDataLocalizedSnippets.push(
	taskService
);

const PersistentDataSnippets: ISnippet[] = snippetsManager(persistentDataLocalizedSnippets);

export default PersistentDataSnippets;
