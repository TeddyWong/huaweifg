import logger from './common/logger';
import { InputProps } from './common/entity';
import { Deploy } from './commands/Deploy';

export default class ComponentDemo {
  /**
   * demo 实例
   * @param inputs
   * @returns
   */
  public async deploy(inputs: InputProps) {
    const deploy = new Deploy(inputs);
    await deploy.run();
  }
}
