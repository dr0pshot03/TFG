/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import api from "../../configs/axios";
import { createModel } from "@rematch/core";

import { Usuario } from "@/types/user.type";

import { IRootModel } from ".";

type IInitialState = {
  user?: Usuario;
  userId?: string;
  loading: boolean;
};

const initialState: IInitialState = {
  loading: false,
};

type IKeys = keyof IInitialState;

const userModel = createModel<IRootModel>()({
  state: initialState, 
  reducers: {

    addValue(
      state,
      payload: {
        key: IKeys;
        value: IInitialState[IKeys];
      }
    ) {
      return {
        ...state,
        [payload.key]: payload.value,
      };
    },

    reset() {
      return { ...initialState };
    },
  },
  effects: (dispatch) => ({
    async getUserDetails(_: void, state) {
      dispatch.userModel.addValue({ key: "loading", value: true });

      await api
        .get("/auth/me")
        .then((res) => {
          dispatch.userModel.addValue({ key: "user", value: res.data.data });
        })
        .catch((error) => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "error",
              title: error.message,
              duration: 5000,
              isClosable: true,
              position: "top-right",
            });
        });

      dispatch.userModel.addValue({ key: "loading", value: false });
    },

    async getUser(id: string, state) {
      dispatch.userModel.addValue({ key:"loading", value: true });

      await api
        .get(`/api/usuario/${id}`)
        .then((res) => {
          dispatch.userModel.addValue({ key: "user", value: res.data });
        })
        .catch((error) => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "error",
              title: error.message,
              duration: 5000,
              isClosable: true,
              position: "top-right"
            })
        })
      dispatch.userModel.addValue({ key: "loading", value: false })
    },

    async updateUserProfile(payload: Partial<Usuario>, state:any) {
      dispatch.userModel.addValue({ key: "loading", value: true });

      try {
        // First update metadata in Clerk
        await api.put("/auth/update-metadata", {
          userId: state.userModel.user?.clerkUser?.id,
        });

        // Then refresh user data
        await dispatch.userModel.getUserDetails();
      } catch (error: any) {
        state.toastModel.toast &&
          state.toastModel.toast({
            status: "error",
            title: error.message,
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        throw error;
      } finally {
        dispatch.userModel.addValue({ key: "loading", value: false });
      }
    },

    async logout() {
      localStorage.clear();
      dispatch({ type: "RESET_APP" });
    },
  }),
});
export default userModel;
