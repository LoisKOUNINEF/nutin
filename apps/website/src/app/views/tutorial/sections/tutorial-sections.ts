import { sortById } from '../../../helpers/index.js';

import SetupAppSection from './1-setup-app/setup-app.section.js';
import HomePageSection from './2-home-page/home-page.section.js';
import TaskCreateSection from './3-task-create/task-create.section.js';
import TaskDeleteSection from './4-task-delete/task-delete.section.js';
import TaskDetailsSection from './5-task-details/task-details.section.js';
import TaskUpdateSection from './6-task-update/task-update.section.js';
import PersistentDataSection from './7-persistent-data/persistent-data.section.js';
import NotificationsSection from './8-notifications/notifications.section.js';

const SectionsArray: ISection[] = [];

SectionsArray.push(
  SetupAppSection,
  HomePageSection,
  TaskCreateSection,
  TaskDeleteSection,
  TaskDetailsSection,
  TaskUpdateSection,
  PersistentDataSection,
  NotificationsSection,
);

const TutorialSections: ISection[] = sortById(SectionsArray);

export default TutorialSections;
