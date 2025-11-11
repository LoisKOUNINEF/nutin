import { sectionManager } from '../../../../helpers/index.js';
import NotificationsSnippets from './snippets/notifications.snippets.js';
import NotificationsSection from './notifications.section.json' with { type: "json" };

export default sectionManager(NotificationsSection, NotificationsSnippets);
