import { Command, Flags } from '@oclif/core';
import { listEnvs } from '../../lib/auth-store.ts';
import { formatCliHomeScope, type CliHomeScope } from '../../lib/cli-home.ts';
import { renderTable } from '../../lib/ui.ts';

export default class EnvList extends Command {
  static summary = 'List configured environments';
  static id = 'env list';

  static flags = {
    scope: Flags.string({
      char: 's',
      description: 'Config scope',
      options: ['project', 'global'],
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EnvList);
    const scope = flags.scope as Exclude<CliHomeScope, 'auto'> | undefined;
    const { currentEnv, envs } = await listEnvs({ scope });
    const names = Object.keys(envs).sort();

    if (!names.length) {
      this.log(`No envs configured${scope ? ` in ${formatCliHomeScope(scope)} scope` : ''}.`);
      this.log('Run `nocobase env add --name <name> --base-url <url> --token <token>` to add one.');
      return;
    }

    const rows = names.map((name) => {
      const env = envs[name];
      return [name === currentEnv ? '*' : '', name, env.baseUrl ?? '', env.runtime?.version ?? ''];
    });

    this.log(renderTable(['Current', 'Name', 'Base URL', 'Runtime'], rows));
  }
}
