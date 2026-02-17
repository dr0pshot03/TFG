/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import api from "../../configs/axios";
import { createModel } from "@rematch/core";

import { UpdateUsuario, Usuario } from "@/types/user.type";

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
    
    async createUsuario (payload: Usuario, state) {
      dispatch.userModel.addValue({ key: "loading", value: true });

      const res = await api
        .post(`/api/usuario/`, payload)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha creado correctamente el examen.",
              isClosable: true,
              duration: 5000,
            });
          return true;
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
          return false;
        })
      dispatch.userModel.addValue({ key:"loading", value: false })
      return res;
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

    async updateUsuario(payload: UpdateUsuario, state:any) {
      dispatch.userModel.addValue({ key: "loading", value: true });

      const res = await api
        .put(`/api/usuario/${payload.clerkId}`, payload)
        .then ((res) => {
          dispatch.examenModel.addValue({ key: "selectedExamen", value: res.data })
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente el usuario.",
              isClosable: true,
              duration: 5000,
            });
          return true;
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
          return false;
        })
      dispatch.userModel.addValue({ key:"loading", value: false })
      return res;
    },

    async logout() {
      localStorage.clear();
      dispatch({ type: "RESET_APP" });
    },
  }),
});
export default userModel;
