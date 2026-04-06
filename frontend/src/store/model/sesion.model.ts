import { createModel } from '@rematch/core';
import api from '@/configs/axios';
import { sesion, CreateSesionInput, UpdateSesionInput } from '@/types/sesion.type';

import { IRootModel } from '.';
import isEqual from 'lodash.isequal';

type IInitialState = {
  loading: boolean;
  sesion: sesion[];
  selectedSesion?: sesion;
};

const initialState: IInitialState = {
  loading: false,
  sesion: [],
};

type IKeys = keyof IInitialState;

const historicoModel = createModel<IRootModel>() ({
  state: initialState,
  reducers: {
    addValue(
      state,
      payload: {
        key: IKeys,
        value: IInitialState[IKeys];
      }
    ) {
      if (state[payload.key] === payload.value) return state; // No actualizar si es el mismo
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
    async getSesionbyId(id: string, state) {
      dispatch.sesionModel.addValue({ key:"loading", value: true });

      await api
        .get(`/sesion/${id}`)
        .then((res) => {
          dispatch.sesionModel.addValue({ key: "selectedSesion", value: res.data });
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
      dispatch.sesionModel.addValue({ key: "loading", value: false })
    },

    async getSesionbyExamen (idExamen: string, state: any) {
      dispatch.sesionModel.addValue({ key: "loading", value: true });

      await api
        .get(`/sesion/examen/${idExamen}`)
        .then((res) => {
          dispatch.sesionModel.addValue({ key: "selectedSesion", value: res.data });
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
        })
      dispatch.sesionModel.addValue({ key:"loading", value: false })
    },

    async getSesionbyUser (idUser: string, state: any) {
      dispatch.sesionModel.addValue({ key: "loading", value: true });

      await api
        .get(`/sesion/usuario/${idUser}`)
        .then((res) => {
          dispatch.sesionModel.addValue({ key: "selectedSesion", value: res.data });
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
        })
      dispatch.sesionModel.addValue({ key:"loading", value: false })
    },

    async createSesion (payload: CreateSesionInput, state) {
      dispatch.sesionModel.addValue({ key: "loading", value: true });

      const res = await api
        .post(`/sesion/`, payload)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha creado correctamente la sesion.",
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
      dispatch.sesionModel.addValue({ key:"loading", value: false })
      return res;
    },

    async updateHistorico (payload: UpdateSesionInput, state) {
      dispatch.sesionModel.addValue({ key: "loading", value: true });

      const res = await api
        .put(`/sesion/${payload.id}`, payload)
        .then ((res) => {
          dispatch.sesionModel.addValue({ key: "selectedSesion", value: res.data })
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente la sesion",
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
      dispatch.sesionModel.addValue({ key:"loading", value: false })
      return res;
    },

    async deleteSesion (id: string, state) {
      dispatch.sesionModel.addValue({ key: "loading", value: true });

      const res = await api
        .delete(`/sesion/${id}`)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha eliminado correctamente la sesion.",
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
      dispatch.sesionModel.addValue({ key:"loading", value: false })
      return res;
    },
  }),
});

export default historicoModel;