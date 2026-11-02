import { PersistenceOptions } from "pinia-plugin-persistedstate";

const piniaPersistConfig = (key: string) => {
    const persist: PersistenceOptions = {
        key,
        storage: localStorage,
        // storage: sessionStorage,
    };
    return persist;
};

export default piniaPersistConfig;