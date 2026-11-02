import forage from "localforage";
import type { LocalForage, ProxyStorage, ExpiresData } from "./types.d";

class StorageProxy implements ProxyStorage {
  protected storage: LocalForage;
  constructor(storageModel) {
    this.storage = storageModel;
    this.storage.config({
      driver: [this.storage.INDEXEDDB, this.storage.LOCALSTORAGE],
      name: "pure-admin"
    });
  }

  public async setItem<T>(k: string, v: T, m = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      this.storage
        .setItem(k, {
          data: v,
          expires: m ? new Date().getTime() + m * 60 * 1000 : 0
        })
        .then(value => {
          resolve(value.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public async getItem<T>(k: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.storage
        .getItem(k)
        .then((value: ExpiresData<T>) => {
          value && (value.expires > new Date().getTime() || value.expires === 0)
            ? resolve(value.data)
            : resolve(null);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public async removeItem(k: string) {
    return new Promise<void>((resolve, reject) => {
      this.storage
        .removeItem(k)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public async clear() {
    return new Promise<void>((resolve, reject) => {
      this.storage
        .clear()
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public async keys() {
    return new Promise<string[]>((resolve, reject) => {
      this.storage
        .keys()
        .then(keys => {
          resolve(keys);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}

export const localForage = () => new StorageProxy(forage);
