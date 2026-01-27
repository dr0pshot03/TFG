import { createModel } from "@rematch/core";
import { IRootModel } from ".";

type ToastIdType = string | number | undefined;
type ToastOptions = any;
type ToastFunction = (options: ToastOptions) => ToastIdType; 

// ----------------

type IToastState = {
  toast?: ToastFunction;
  toastId?: ToastIdType;
};

const initialState: IToastState = {};

export const toastModel = createModel<IRootModel>()({
  state: initialState,
  selectors: (slice) => ({
    toast() {
      return slice((state) => state.toast);
    },
  }),
  reducers: {
    initToast(state, toast: ToastFunction) {
      // Guardamos la función en el estado
      // @ts-ignore
      state.toast = toast;
    },
    saveToastId(state, toastId: ToastIdType) {
      state.toastId = toastId;
    },
  },
});