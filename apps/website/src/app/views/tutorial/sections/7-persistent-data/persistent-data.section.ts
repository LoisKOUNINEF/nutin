import { BuildSectionHelper } from '../../../../helpers/index.js';
import TaskServiceSnippet from './snippets/task-service.snippet.json' with { type: "json" };
import PersistentDataSection from './persistent-data.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(PersistentDataSection, [TaskServiceSnippet]);
