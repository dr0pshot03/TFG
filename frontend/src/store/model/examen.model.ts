import { createModel } from '@rematch/core';
import api from '@/configs/axios';
import { Examen, CreateExamenInput, UpdateExamenInput, Convocatoria } from '@/types/examen.type';

import { IRootModel } from '.';
import isEqual from 'lodash.isequal';

type IInitialState = {
  loading: boolean;
  examenes: Examen[];
  selectedExamen?: Examen;
};

const initialState: IInitialState = {
  loading: false,
  examenes: [],
};

type IKeys = keyof IInitialState;

const examenModel = createModel<IRootModel>() ({
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
    async getExamen(id: string, state) {
      dispatch.examenModel.addValue({ key:"loading", value: true });

      await api
        .get(`/api/examen/${id}`)
        .then((res) => {
          dispatch.examenModel.addValue({ key: "selectedExamen", value: res.data });
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
      dispatch.examenModel.addValue({ key: "loading", value: false })
    },

    async getExamenes (idAsign: string, state: any) {
      dispatch.examenModel.addValue({ key: "loading", value: true });

      await api
        .get(`/api/examen/asignatura/${idAsign}`)
        .then ((res) => {
          const currentExamenes = state.examenModel.examenes;
          const isSame = isEqual(currentExamenes, res.data);
          if (!isSame) {
            dispatch.examenModel.addValue({ key: "examenes", value: res.data });
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
      dispatch.examenModel.addValue({ key:"loading", value: false })
    },

    async createExamen (payload: CreateExamenInput, state) {
      dispatch.examenModel.addValue({ key: "loading", value: true });

      const res = await api
        .post(`/api/examen/`, payload)
        .then ((response) => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha creado correctamente el examen.",
              isClosable: true,
              duration: 5000,
            });
          return response.data;
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
          return null;
        })
      dispatch.examenModel.addValue({ key:"loading", value: false })
      return res;
    },

    async updateConvocatoria(payload: { id: string; convocatoria: Convocatoria }, state) {
      dispatch.examenModel.addValue({ key: "loading", value: true });

      const res = await api
        .patch(`/api/examen/convocatoria/${payload.id}`, { status: payload.convocatoria })
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente la convocatoria",
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

      dispatch.Model.addValue({ key:"loading", value: false })
      return res;
    },

    async updateExamen (payload: UpdateExamenInput, state) {
      dispatch.examenModel.addValue({ key: "loading", value: true });

      const res = await api
        .put(`/api/examen/${payload.id}`, payload)
        .then ((res) => {
          dispatch.examenModel.addValue({ key: "selectedExamen", value: res.data })
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente el examen.",
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
      dispatch.examenModel.addValue({ key:"loading", value: false })
      return res;
    },

    async updateTimeExamen (payload: UpdateExamenInput, state) {
      dispatch.examenModel.addValue({ key: "loading", value: true });

      const res = await api
        .put(`/api/examen/tiempo/${payload.id}`, payload)
        .then ((res) => {
          dispatch.examenModel.addValue({ key: "selectedExamen", value: res.data })
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha actualizado correctamente el examen.",
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
      dispatch.examenModel.addValue({ key:"loading", value: false })
      return res;
    },

    async deleteExamen (id: string, state) {
      dispatch.examenModel.addValue({ key: "loading", value: true });

      const res = await api
        .delete(`/api/examen/${id}`)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha borrado correctamente el examen",
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
      dispatch.examenModel.addValue({ key:"loading", value: false })
      return res;
    },
  }),
});

export default examenModel;