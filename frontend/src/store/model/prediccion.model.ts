import { createModel } from '@rematch/core';
import api from '@/configs/axios';
import { prediccion, CreatePrediccionInput, UpdatePrediccionInput } from '@/types/prediccion.type';

import { IRootModel } from '.';
import isEqual from 'lodash.isequal';

type IInitialState = {
  loading: boolean;
  prediccion: prediccion[];
  selectedPrediccion?: prediccion;
};

const initialState: IInitialState = {
  loading: false,
  prediccion: [],
};

type IKeys = keyof IInitialState;

const prediccionModel = createModel<IRootModel>() ({
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
    async getEvento(id: string, state) {
      dispatch.prediccionModel.addValue({ key:"loading", value: true });

      await api
        .get(`/prediccion/${id}`)
        .then((res) => {
          dispatch.eventoModel.addValue({ key: "selectedPrediccion", value: res.data });
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
      dispatch.prediccionModel.addValue({ key: "loading", value: false })
    },

    async getAllPrediccion (idSesion: string, state: any) {
      dispatch.prediccionModel.addValue({ key: "loading", value: true });

      await api
        .get(`/prediccion/sesion/${idSesion}`)
        .then((res) => {
          dispatch.prediccionModel.addValue({ key: "selectedPrediccion", value: res.data });
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
      dispatch.prediccionModel.addValue({ key:"loading", value: false })
    },

    async createPrediccion (payload: CreatePrediccionInput, state) {
      dispatch.prediccionModel.addValue({ key: "loading", value: true });

      const res = await api
        .post(`/prediccion/`, payload)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha creado correctamente la prediccion.",
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
      dispatch.prediccionModel.addValue({ key:"loading", value: false })
      return res;
    },

    async updatePrediccion (payload: UpdatePrediccionInput, state) {
      dispatch.prediccionModel.addValue({ key: "loading", value: true });

      const res = await api
        .put(`/prediccion/${payload.id}`, payload)
        .then ((res) => {
          dispatch.prediccionModel.addValue({ key: "selectedPrediccion", value: res.data })
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente la prediccion.",
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
      dispatch.prediccionModel.addValue({ key:"loading", value: false })
      return res;
    },

    async deletePrediccion (id: string, state) {
      dispatch.prediccionModel.addValue({ key: "loading", value: true });

      const res = await api
        .delete(`/prediccion/${id}`)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({ 
              status: "success",
              position: "top-right",
              title: "Se ha borrado correctamente la prediccion",
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
      dispatch.prediccionModel.addValue({ key:"loading", value: false })
      return res;
    },
  }),
});

export default UpdatePrediccionInputModel;