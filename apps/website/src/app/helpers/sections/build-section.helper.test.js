import { BuildSectionHelper } from '#root/dist/src/app/helpers/sections/build-section.helper.js';

const section1 = { 
	"id": 1,
	"en": {
		"name": "English 1",
		"content": "English content 1",
		"notes": "English notes 1"
	},
	"fr":	{
		"name": "Français 1",
		"content": "Contenu français 1",
		"notes": "Notes français 1"
	}
}

const snippets1 = [
	{
		"id": 2,
		"sectionId": 1,
		"content": "class Snippet12 {}",
		"type": "ts",
		"en": {
			"before": "Snippet before 12",
			"after": "Snippet after 12"
		},
		"fr": {
			"before": "Snippet avant 12",
			"after": "Snippet après 12"
		}
	},
	{
		"id": 1,
		"sectionId": 1,
		"content": "npm run test",
		"type": "none",
		"en": {
			"before": "Snippet before 11",
			"after": "Snippet after 11"
		},
		"fr": {
			"before": "Snippet avant 11",
			"after": "Snippet après 11"
		}
	}
]

const section2 = { 
	"id": 2,
	"en":	{
		"name": "English 2",
		"content": "English content 2"
	},
	"fr":	{
		"name": "Français 2",
		"content": "Contenu français 2"
	}
}

const snippets2 = [{
	"id": 1,
	"sectionId": 2,
	"content": "class Snippet21 {}",
	"type": "ts",
		"en": {
			"before": "Snippet before 21",
			"after": "Snippet after 21"
		},
		"fr": {
			"before": "Snippet avant 21",
			"after": "Snippet après 21"
		}
}]

const englishBuilt1 = {
  name: 'English 1',
  content: 'English content 1',
  notes: 'English notes 1',
  id: 1,
  snippets: [
    {
      before: 'Snippet before 12',
      after: 'Snippet after 12',
      id: 2,
      sectionId: 1,
      content: 'class Snippet12 {}',
      type: 'ts'
    },
    {
      before: 'Snippet before 11',
      after: 'Snippet after 11',
      id: 1,
      sectionId: 1,
      content: 'npm run test',
      type: 'none'
    }
  ]
}
 const englishBuilt2 = {
  name: 'English 2',
  content: 'English content 2',
  id: 2,
  snippets: [
    {
      before: 'Snippet before 21',
      after: 'Snippet after 21',
      id: 1,
      sectionId: 2,
      content: 'class Snippet21 {}',
      type: 'ts'
    }
  ]
}

const frenchBuilt1 = {
  name: 'Français 1',
  content: 'Contenu français 1',
  notes: 'Notes français 1',
  id: 1,
  snippets: [
    {
      before: 'Snippet avant 12',
      after: 'Snippet après 12',
      id: 2,
      sectionId: 1,
      content: 'class Snippet12 {}',
      type: 'ts'
    },
    {
      before: 'Snippet avant 11',
      after: 'Snippet après 11',
      id: 1,
      sectionId: 1,
      content: 'npm run test',
      type: 'none'
    }
  ]
}

const frenchBuilt2 = {
  name: 'Français 2',
  content: 'Contenu français 2',
  id: 2,
  snippets: [
    {
      before: 'Snippet avant 21',
      after: 'Snippet après 21',
      id: 1,
      sectionId: 2,
      content: 'class Snippet21 {}',
      type: 'ts'
    }
  ]
}

describe('BuildSectionHelper', () => {
	it('should use default language to build a translated section with its translated snippets', () => {
		const spy = spyOn(BuildSectionHelper, 'buildSection');
		const built1 = BuildSectionHelper.buildSection(section1, snippets1);
		expect(spy).toHaveBeenCalledWith(section1, snippets1);
		expect(JSON.stringify(built1)).toBe(JSON.stringify(englishBuilt1));

		const built2 = BuildSectionHelper.buildSection(section2, snippets2);
		expect(spy).toHaveBeenCalledWith(section2, snippets2);
		expect(JSON.stringify(built2)).toBe(JSON.stringify(englishBuilt2));
	});
	it('should use current language to build a translated section with its translated snippets', () => {
		BuildSectionHelper['lang'] = 'fr';
		const spy = spyOn(BuildSectionHelper, 'buildSection');
		const built1 = BuildSectionHelper.buildSection(section1, snippets1);
		expect(spy).toHaveBeenCalledWith(section1, snippets1);
		expect(JSON.stringify(built1)).toBe(JSON.stringify(frenchBuilt1));
		const built2 = BuildSectionHelper.buildSection(section2, snippets2);
		expect(spy).toHaveBeenCalledWith(section2, snippets2);
		expect(JSON.stringify(built2)).toBe(JSON.stringify(frenchBuilt2));
	})
	it('should use default language to build a batch of translated section with their translated snippets', () => {
		BuildSectionHelper['lang'] = 'en';
		const spy = spyOn(BuildSectionHelper, 'buildSectionBatch');
		const built = BuildSectionHelper.buildSectionBatch([{section: section1, snippets: snippets1}, {section: section2, snippets: snippets2}]);
		expect(spy).toHaveBeenCalledWith([{section: section1, snippets: snippets1}, {section: section2, snippets: snippets2}]);
		expect(JSON.stringify(built)).toBe(JSON.stringify([ englishBuilt1, englishBuilt2 ]));
	});
	it('should use current language to build a batch of translated section with their translated snippets', () => {
		BuildSectionHelper['lang'] = 'fr';
		const spy = spyOn(BuildSectionHelper, 'buildSectionBatch');
		const built = BuildSectionHelper.buildSectionBatch([{section: section1, snippets: snippets1}, {section: section2, snippets: snippets2}]);
		expect(spy).toHaveBeenCalledWith([{section: section1, snippets: snippets1}, {section: section2, snippets: snippets2}]);
		expect(JSON.stringify(built)).toBe(JSON.stringify([ frenchBuilt1, frenchBuilt2 ]));
	})
})