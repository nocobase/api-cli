import { Command, Flags } from '@oclif/core';
import { getCurrentEnvName, getEnv } from '../../lib/auth-store.ts';
import { formatCliHomeScope, type CliHomeScope } from '../../lib/cli-home.ts';
import { renderTable } from '../../lib/ui.ts';

export default class Env extends Command {
  static summary = 'Show the current environment';
  static id = 'env';

  static flags = {
    scope: Flags.string({
      char: 's',
      description: 'Config scope',
      options: ['project', 'global'],
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Env);
    const scope = flags.scope as Exclude<CliHomeScope, 'auto'> | undefined;
    const envName = await getCurrentEnvName({ scope });
    const env = await getEnv(envName, { scope });

    if (!env?.baseUrl) {
      this.log(`No current env is configured${scope ? ` in ${formatCliHomeScope(scope)} scope` : ''}.`);
      this.log('Run `nocobase env add --name <name> --base-url <url> --token <token>` to add one.');
      return;
    }

    this.log(
      renderTable(['Name', 'Base URL', 'Runtime'], [[envName, env?.baseUrl ?? '', env?.runtime?.version ?? '']]),
    );
  }
}
