import { BuildSectionHelper } from '../../../../helpers/index.js';
import NotificationsSection from './notifications.section.json' with { type: "json" };
import NotifySnippet from './snippets/notify.snippet.json' with { type: "json" };
import PopoverSnippet from './snippets/popover.snippet.json' with { type: "json" };

export default BuildSectionHelper.buildSection(NotificationsSection, [NotifySnippet, PopoverSnippet]);
