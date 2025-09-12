import { sectionManager } from '../../../../helpers/index.js';
import NotificationsSnippets from './snippets/notifications.snippets.js';
import notificationsSection from './notifications.json' with { type: "json" };

const NotificationsSection: ISection = sectionManager(notificationsSection, NotificationsSnippets);

export default NotificationsSection;
