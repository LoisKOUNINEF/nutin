import { BuildSectionHelper } from '../../../../../helpers/index.js';
import DeploymentSection from './deployment.section.json' with { type: "json" };
import CommandsSnippet from './snippets/commands.snippet.json' with { type: "json" };
import DockerfileSnippet from './snippets/dockerfile.snippet.json' with { type: "json" };
import NginxConfSnippet from './snippets/nginx-conf.snippet.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	DeploymentSection, 
	[
		CommandsSnippet,
		DockerfileSnippet,
		NginxConfSnippet,
	]
);
