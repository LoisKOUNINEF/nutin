import { snippetsManager } from '../../../../../helpers/index.js';
import classes from './classes.json' with { type: 'json' };

const classesLocalizedSnippets: LocalizedSnippet[] = [];

classesLocalizedSnippets.push(classes); 

const ClassesSnippets: ISnippet[] = snippetsManager(classesLocalizedSnippets);

export default ClassesSnippets;
