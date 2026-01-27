import { createModel } from '@rematch/core';
import api from '@/configs/axios';
import { Asignatura, CreateAsignaturaInput, UpdateAsignaturaInput } from '@/types/asignatura.type';

import { IRootModel } from '.';
import isEqual from 'lodash.isequal';

type IInitialState = {
  loading: boolean;
  asignaturas: Asignatura[];
  selectedAsignatura?: Asignatura;
};

const initialState: IInitialState = {
  loading: false,
  asignaturas: [],
};

type IKeys = keyof IInitialState;

const asignaturaModel = createModel<IRootModel>() ({
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
    async getAsignatura(id: string, state) {
      dispatch.asignaturaModel.addValue({ key:"loading", value: true });

      await api
        .get(`/api/asignaturas/${id}`)
        .then((res) => {
          dispatch.asignaturaModel.addValue({ key: "selectedAsignatura", value: res.data });
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
      dispatch.asignaturaModel.addValue({ key: "loading", value: false })
    },

    async getAsignaturas (userId: string, state: any) {
      dispatch.asignaturaModel.addValue({ key: "loading", value: true });

      await api
        .get(`/api/asignaturas/usuario/${userId}`)
        .then ((res) => {
          const currentAsignaturas = state.asignaturaModel.asignaturas;
          const isSame = isEqual(currentAsignaturas, res.data);
          if (!isSame) {
            dispatch.asignaturaModel.addValue({ key: "asignaturas", value: res.data });
          }
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
      dispatch.asignaturaModel.addValue({ key:"loading", value: false })
    },

    async createAsignatura (payload: CreateAsignaturaInput, state) {
      dispatch.asignaturaModel.addValue({ key: "loading", value: true });

      const res = await api
        .post(`/api/asignaturas/`, payload)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha creado correctamente la asignatura.",
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
      dispatch.asignaturaModel.addValue({ key:"loading", value: false })
      return res;
    },

    async updateAsignatura (payload: UpdateAsignaturaInput, state) {
      dispatch.asignaturaModel.addValue({ key: "loading", value: true });

      const res = await api
        .put(`/api/asignaturas/${payload.id}`, payload)
        .then ((res) => {
          dispatch.asignaturaModel.addValue({ key: "selectedAsignatura", value: res.data })
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente la asignatura.",
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
      dispatch.asignaturaModel.addValue({ key:"loading", value: false })
      return res;
    },

    async deleteAsignatura (id: string, state) {
      dispatch.asignaturaModel.addValue({ key: "loading", value: true });

      const res = await api
        .delete(`/api/asignaturas/${id}`)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha borrado correctamente la asignatura",
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
      dispatch.asignaturaModel.addValue({ key:"loading", value: false })
      return res;
    },
  }),
});

export default asignaturaModel;