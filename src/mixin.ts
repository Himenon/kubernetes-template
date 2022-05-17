import type * as Factory from "@source/types/factory";

import { ManifestWriter, ReportWriter } from "./writer";

export class Mixin {
  private manifestWriter: ManifestWriter;
  private reportWriter: ReportWriter;
  constructor(private workingDirectory: string, private targets: Factory.RootFactory[]) {
    this.manifestWriter = new ManifestWriter(workingDirectory);
    this.reportWriter = new ReportWriter("report");
  }

  public cleanup() {
    this.manifestWriter.cleanup(this.workingDirectory);
  }

  private get filteredTargets() {
    return this.targets;
  }

  private get directoryNames(): string[] {
    return this.filteredTargets.filter((target) => target.create().length > 0).map((target) => target.directoryName);
  }

  public createManifestTasks(): Promise<void>[] {
    return this.targets.map((factory) => {
      const items = factory.create();
      return this.manifestWriter.writerResources(factory.directoryName, items);
    });
  }

  public createRootKustomization(additinalPaths: string[]): Promise<void> {
    return this.manifestWriter.writeRootKustomization([...additinalPaths, ...this.directoryNames], []);
  }

  public async generateResourceReport(env: string): Promise<void> {
    await this.reportWriter.generateResourceReport(env, this.targets);
  }
}
