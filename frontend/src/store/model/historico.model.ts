import { createModel } from '@rematch/core';
import api from '@/configs/axios';
import { historico, CreateHistoricoInput, UpdateHistoricoInput } from '@/types/historico.type';

import { IRootModel } from '.';
import isEqual from 'lodash.isequal';

type IInitialState = {
  loading: boolean;
  historico: historico[];
  selectedHistorico?: historico;
};

const initialState: IInitialState = {
  loading: false,
  historico: [],
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
    async getHistorico(idAsign: string, state) {
      dispatch.historicoModel.addValue({ key:"loading", value: true });

      await api
        .get(`/historico/${idAsign}`)
        .then((res) => {
          dispatch.historicoModel.addValue({ key: "selectedHistorico", value: res.data });
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
      dispatch.historicoModel.addValue({ key: "loading", value: false })
    },

    async getOneHistorico (idExamen: string, state: any) {
      dispatch.historicoModel.addValue({ key: "loading", value: true });

      await api
        .get(`/historico/historico/${idExamen}`)
        .then((res) => {
          dispatch.historicoModel.addValue({ key: "selectedHistorico", value: res.data });
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
      dispatch.historicoModel.addValue({ key:"loading", value: false })
    },

    async createHistorico (payload: CreateHistoricoInput, state) {
      dispatch.historicoModel.addValue({ key: "loading", value: true });

      const res = await api
        .post(`/historico/`, payload)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha creado correctamente el historico.",
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
      dispatch.historicoModel.addValue({ key:"loading", value: false })
      return res;
    },

    async updateHistorico (payload: UpdateHistoricoInput, state) {
      dispatch.historicoModel.addValue({ key: "loading", value: true });

      const res = await api
        .put(`/historico/${payload.id}`, payload)
        .then ((res) => {
          dispatch.historicoModel.addValue({ key: "selectedHistorico", value: res.data })
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente el historico.",
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
      dispatch.historicoModel.addValue({ key:"loading", value: false })
      return res;
    },

    async deleteHistorico (id: string, state) {
      dispatch.historicoModel.addValue({ key: "loading", value: true });

      const res = await api
        .delete(`/historico/${id}`)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha borrado correctamente el historico",
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
      dispatch.historicoModel.addValue({ key:"loading", value: false })
      return res;
    },
  }),
});

export default historicoModel;