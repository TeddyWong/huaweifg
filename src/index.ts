import { Deploy } from './commands/Deploy';
import { InputProps } from './common/entity';

export default class HuaweiFunctionGraph {
  public async deploy(inputs: InputProps) {
    const deploy = new Deploy(inputs);
    await deploy.run();
  }
}
