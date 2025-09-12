import { snippetsManager } from '../../../../../helpers/index.js';
import notify from './notify.json' with { type: "json" };
import popover from './popover.json' with { type: "json" };

const notificationsLocalizedSnippets: LocalizedSnippet[] = [];

notificationsLocalizedSnippets.push(
	notify,
	popover,
); 

const NotificationsSnippets: ISnippet[] = snippetsManager(notificationsLocalizedSnippets);

export default NotificationsSnippets;
