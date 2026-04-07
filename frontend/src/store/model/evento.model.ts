import { createModel } from '@rematch/core';
import api from '@/configs/axios';
import { evento, CreateEventoInput } from '@/types/evento.type';

import { IRootModel } from '.';

type IInitialState = {
  loading: boolean;
  evento: evento[];
  selectedEvento?: evento;
};

const initialState: IInitialState = {
  loading: false,
  evento: [],
};

type IKeys = keyof IInitialState;

const eventoModel = createModel<IRootModel>() ({
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
      dispatch.eventoModel.addValue({ key:"loading", value: true });

      await api
        .get(`/evento/${id}`)
        .then((res) => {
          dispatch.eventoModel.addValue({ key: "selectedEvento", value: res.data });
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
      dispatch.eventoModel.addValue({ key: "loading", value: false })
    },

    async getAllEventos (idSesion: string, state: any) {
      dispatch.eventoModel.addValue({ key: "loading", value: true });

      await api
        .get(`/evento/sesion/${idSesion}`)
        .then((res) => {
          dispatch.eventoModel.addValue({ key: "evento", value: res.data });
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
      dispatch.eventoModel.addValue({ key:"loading", value: false })
    },

    async createEvento (payload: CreateEventoInput, state) {
      dispatch.eventoModel.addValue({ key: "loading", value: true });

      const res = await api
        .post(`/evento/`, payload)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({
              status: "success",
              position: "top-right",
              title: "Se ha creado correctamente el evento.",
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
      dispatch.eventoModel.addValue({ key:"loading", value: false })
      return res;
    },

    async deleteEvento (id: string, state) {
      dispatch.eventoModel.addValue({ key: "loading", value: true });

      const res = await api
        .delete(`/evento/${id}`)
        .then (() => {
          state.toastModel.toast &&
            state.toastModel.toast({ 
              status: "success",
              position: "top-right",
              title: "Se ha borrado correctamente el evento",
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
      dispatch.eventoModel.addValue({ key:"loading", value: false })
      return res;
    },
  }),
});

export default eventoModel;