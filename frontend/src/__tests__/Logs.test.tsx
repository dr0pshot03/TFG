import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";
import Logs from "@pages/Dashboard/Logs";

const {
  getExamenMock,
  getAllEventosMock,
  getAsignaturaMock,
  useParamsMock,
  mockState,
} = vi.hoisted(() => {
  const getExamenMock = vi.fn();
  const getAllEventosMock = vi.fn();
  const getAsignaturaMock = vi.fn();
  const useParamsMock = vi.fn(() => ({ idExamen: "exam-1" }));

  return {
    getExamenMock,
    getAllEventosMock,
    getAsignaturaMock,
    useParamsMock,
    mockState: {
      examenModel: {
        selectedExamen: {
          id: "exam-1",
          id_asign: "asig-1",
          fecha_examen: "2026-05-12T10:15:00.000Z",
          sesion: [
            {
              id: "ses-1",
            },
          ],
        },
      },
      asignaturaModel: {
        selectedAsignatura: {
          id: "asig-1",
          nombre: "Matemáticas",
        },
      },
      eventoModel: {
        evento: [
          {
            id: "ev-1",
            tipo_evento: "Iniciado",
            timestamp: "2026-05-12T10:20:30.000Z",
          },
        ],
      },
    },
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useParams: () => useParamsMock(),
  };
});

vi.mock("react-redux", () => ({
  useDispatch: () => ({
    examenModel: {
      getExamen: getExamenMock,
    },
    eventoModel: {
      getAllEventos: getAllEventosMock,
    },
    asignaturaModel: {
      getAsignatura: getAsignaturaMock,
    },
  }),
  useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock("@pages/Dashboard/NavBar", () => ({
  NavBar: () => <div data-testid="navbar" />,
}));

describe("Logs", () => {
  it("Carga el examen, la asignatura y los eventos al montar", async () => {
    render(
      <ChakraProviderWrapper>
        <MemoryRouter>
          <Logs />
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await waitFor(() => {
      expect(getExamenMock).toHaveBeenCalledWith("exam-1");
      expect(getAllEventosMock).toHaveBeenCalledWith("ses-1");
      expect(getAsignaturaMock).toHaveBeenCalledWith("asig-1");
    });

    expect(screen.getByText("Logs del examen 12/05/2026 - Matemáticas")).toBeInTheDocument();
    expect(screen.getByText("Iniciado")).toBeInTheDocument();
    expect(screen.getByText(/20:30/)).toBeInTheDocument();
  });
});