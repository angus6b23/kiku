import { store } from "@/store/store";

const getInstanceLists = () => {
    const state = store.getState();
    return state.config.instance.preferType
}

export {getInstanceLists}
