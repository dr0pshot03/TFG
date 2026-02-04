import { createModel } from '@rematch/core';
import api from '@/configs/axios';
import { parteExamen, CreateParteExamenInput, UpdateParteExamenInput } from '@/types/parteExamen.type';

import { IRootModel } from '.';
import isEqual from 'lodash.isequal';

type IInitialState = {
  loading: boolean;
  partesExamenes: parteExamen[];
  selectedParteExamen?: parteExamen;
};

const initialState: IInitialState = {
  loading: false,
  partesExamenes: [],
};

type IKeys = keyof IInitialState;

const partesExamenModel = createModel<IRootModel>() ({
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
    async getParteExamen(id: string, state) {
      dispatch.parteExamenModel.addValue({ key:"loading", value: true });

      await api
        .get(`/api/partesExamen/parte/${id}`)
        .then((res) => {
          dispatch.parteExamenModel.addValue({ key: "selectedParteExamen", value: res.data });
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
      dispatch.parteExamenModel.addValue({ key: "loading", value: false })
    },

    async getPartesExamenes (idExamen: string, state: any) {
      dispatch.parteExamenModel.addValue({ key: "loading", value: true });

      await api
        .get(`/api/partesExamen/${idExamen}`)
        .then ((res) => {
          const currentPartesExamenes = state.parteExamenModel.examenes;
          const isSame = isEqual(currentPartesExamenes, res.data);
          if (!isSame) {
            dispatch.parteExamenModel.addValue({ key: "partesExamenes", value: res.data });
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
      dispatch.parteExamenModel.addValue({ key:"loading", value: false })
    },

    async createParteExamen (payload: CreateParteExamenInput, state) {
      dispatch.parteExamenModel.addValue({ key: "loading", value: true });

      const res = await api
        .post(`/api/partesExamen/`, payload)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha creado correctamente la parte del examen.",
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
      dispatch.parteExamenModel.addValue({ key:"loading", value: false })
      return res;
    },

    async updateParteExamen (payload: UpdateParteExamenInput, state) {
      dispatch.parteExamenModel.addValue({ key: "loading", value: true });

      const res = await api
        .put(`/api/partesExamen/${payload.id}`, payload)
        .then ((res) => {
          dispatch.parteExamenModel.addValue({ key: "selectedParteExamen", value: res.data })
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente la parte del examen.",
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
      dispatch.parteExamenModel.addValue({ key:"loading", value: false })
      return res;
    },

    async deleteParteExamen (id: string, state) {
      dispatch.parteExamenModel.addValue({ key: "loading", value: true });

      const res = await api
        .delete(`/api/partesExamen/${id}`)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha borrado correctamente la parte del examen",
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
      dispatch.parteExamenModel.addValue({ key:"loading", value: false })
      return res;
    },
  }),
});

export default partesExamenModel;