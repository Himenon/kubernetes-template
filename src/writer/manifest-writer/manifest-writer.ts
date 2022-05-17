import * as k8s from "@source/k8s";
import type * as Factory from "@source/types/factory";
import * as del from "del";
import * as fs from "fs";
import * as path from "path";

import { isDirectory, isManifest } from "../type-guard";
import { sortAlphabetalize, stringifyYaml } from "../utils";

const isSilent = !!process.env.GENERATOR_SILENT;

export class ManifestWriter {
  private yamlExt = ".yml";
  constructor(private baseDir: string) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  public cleanup(p: string): void {
    if (!isSilent) {
      console.log(`Cleanup ${p}`);
    }
    del.sync(p);
  }

  private isEmptyDirectory(item: Factory.Directory) {
    return item.children.create().length === 0;
  }

  private createKustomization(items: Factory.Item[]): [boolean, Factory.Manifest] {
    const resources: string[] = items
      .filter((item) => item.includeKustomization !== false)
      .filter((item) => {
        if (isDirectory(item)) {
          return !this.isEmptyDirectory(item);
        }
        return true;
      })
      .map<string>((item) => {
        if (isManifest(item)) {
          return `${item.name}${this.yamlExt}`;
        } else if (isDirectory(item)) {
          return item.name;
        }
        console.error(item);
        throw new Error("Not found item.");
      });
    const value = k8s.Kustomization.create({
      resources: sortAlphabetalize(resources),
    });
    return [
      resources.length > 0,
      {
        name: "kustomization",
        value: value,
      },
    ];
  }

  private async createDirectory(outputDir: string, item: Factory.Directory): Promise<string> {
    return new Promise((resolve, reject) => {
      const dirname = path.join(outputDir, item.name);
      fs.mkdir(dirname, { recursive: true }, (err) => {
        if (err !== null) {
          reject(err);
        } else {
          resolve(dirname);
        }
      });
    });
  }

  private async writeManifest(outputDir: string, item: Factory.Manifest, ext = this.yamlExt): Promise<void> {
    return new Promise((resolve, reject) => {
      const filename = path.join(outputDir, `${item.name}${ext}`);
      const data = stringifyYaml(item.value, item.stringifyVersion);
      fs.writeFile(filename, data, (err) => {
        if (err !== null) {
          reject(err);
        } else {
          if (!isSilent) {
            console.log(`Generate: ${filename}`);
          }
          resolve();
        }
      });
    });
  }

  private async createItem(outputDir: string, item: Factory.Item, ext = this.yamlExt): Promise<void> {
    if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    if (isDirectory(item)) {
      const items = item.children.create();
      if (items.length === 0) {
        return;
      }
      const childOutputDir = await this.createDirectory(outputDir, item);
      await this.createItems(childOutputDir, items);
    } else if (isManifest(item)) {
      await this.writeManifest(outputDir, item, ext);
    }
  }

  private async createItems(outputDir: string, items: Factory.Item[]): Promise<void> {
    const [ok, kustomizationItem] = this.createKustomization(items);
    const tasks = (ok ? [...items, kustomizationItem] : items).map(async (item) => {
      return this.createItem(outputDir, item);
    });
    await Promise.all(tasks);
  }

  public async writerResources(directoryName: string, items: Factory.Item[]): Promise<void> {
    const outputDir = path.join(this.baseDir, directoryName);
    await this.createItems(outputDir, items);
  }

  private getFilePaths(factories: Factory.RootFactory[]): string[] {
    return factories
      .map((factory) => {
        const items = factory.create();
        return items.map((item) => {
          if (isManifest(item)) {
            return path.join(factory.directoryName, `${item.name}${this.yamlExt}`);
          }
          throw new Error("direcoryには対応していません");
        });
      })
      .flat();
  }

  public async writeRootKustomization(directoryNames: string[], patchFactories: Factory.RootFactory[]): Promise<void> {
    const pathFilePaths = this.getFilePaths(patchFactories);
    const value = k8s.Kustomization.create({
      resources: sortAlphabetalize(directoryNames),
      patchesStrategicMerge: pathFilePaths.length > 0 ? sortAlphabetalize(pathFilePaths) : undefined,
    });
    const item: Factory.Item = {
      name: "kustomization",
      value: value,
    };
    this.createItem(this.baseDir, item);
  }
}
