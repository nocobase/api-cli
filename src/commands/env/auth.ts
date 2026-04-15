import { Command, Flags } from '@oclif/core';
import { type CliHomeScope, formatCliHomeScope } from '../../lib/cli-home.ts';
import { authenticateEnvWithOauth } from '../../lib/env-auth.ts';
import { failTask, startTask, succeedTask } from '../../lib/ui.ts';

export default class EnvAuth extends Command {
  static summary = 'Authenticate an environment with OAuth';
  static id = 'env auth';

  static flags = {
    env: Flags.string({
      char: 'e',
      description: 'Environment name',
    }),
    scope: Flags.string({
      char: 's',
      description: 'Config scope',
      options: ['project', 'global'],
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EnvAuth);
    const scope = flags.scope as Exclude<CliHomeScope, 'auto'> | undefined;
    const envLabel = flags.env ?? 'current';

    startTask(`Authenticating env: ${envLabel}${scope ? ` (${formatCliHomeScope(scope)})` : ''}`);

    try {
      await authenticateEnvWithOauth({
        envName: flags.env,
        scope,
      });
      succeedTask(`Authenticated env "${envLabel}" with OAuth${scope ? ` in ${formatCliHomeScope(scope)} scope` : ''}.`);
    } catch (error) {
      failTask(`Failed to authenticate env "${envLabel}".`);
      throw error;
    }
  }
}
