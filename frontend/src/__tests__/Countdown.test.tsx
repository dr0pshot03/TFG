import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";
import Countdown from "@pages/Dashboard/Countdown";

const {
  getAsignaturaMock,
  getExamenMock,
  getPartesExamenMock,
  getSesionByIdMock,
  createEventoMock,
  createHistoricoMock,
  navigateMock,
  useParamsMock,
  mockState,
} = vi.hoisted(() => ({
  getAsignaturaMock: vi.fn(),
  getExamenMock: vi.fn(),
  getPartesExamenMock: vi.fn(),
  getSesionByIdMock: vi.fn(),
  createEventoMock: vi.fn(),
  createHistoricoMock: vi.fn(),
  navigateMock: vi.fn(),
  useParamsMock: vi.fn(() => ({ idAsign: "asig-1", idExamen: "exam-1", idSesion: "ses-1" })),
  mockState: {
    asignaturaModel: {
      selectedAsignatura: {
        id: "asig-1",
        nombre: "Matemáticas",
      },
    },
    examenModel: {
      selectedExamen: {
        id: "exam-1",
        id_asign: "asig-1",
        convocatoria: "Junio",
        tipo_convocatoria: "Ordinaria",
        fecha_examen: "2026-05-12T00:00:00.000Z",
      },
    },
    parteExamenModel: {
      partesExamenes: [
        {
          id: "parte-1",
          nombre: "Tema 1",
          duracion_h: 1,
          duracion_m: 30,
        },
      ],
    },
    sesionModel: {
      selectedSesion: {
        id: "ses-1",
        n_esperados: 20,
        n_present: 0,
      },
    },
  },
}));

class AudioMock {
  currentTime = 0;
  play = vi.fn().mockResolvedValue(undefined);
}

vi.stubGlobal("Audio", AudioMock);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useParams: () => useParamsMock(),
    useNavigate: () => navigateMock,
  };
});

vi.mock("react-redux", () => ({
  useDispatch: () => ({
    asignaturaModel: {
      getAsignatura: getAsignaturaMock,
    },
    examenModel: {
      getExamen: getExamenMock,
      getExamenes: vi.fn(),
      updateEstadoExamen: vi.fn(),
    },
    parteExamenModel: {
      getPartesExamen: getPartesExamenMock,
      sumarMinutosParteExamen: vi.fn(),
    },
    sesionModel: {
      getSesionbyId: getSesionByIdMock,
      createSesion: vi.fn(),
      updateHistorico: vi.fn(),
    },
    eventoModel: {
      createEvento: createEventoMock,
    },
    historicoModel: {
      createHistorico: createHistoricoMock,
    },
  }),
  useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({
    user: {
      firstName: "Ana",
      lastName: "López",
    },
  }),
}));

vi.mock("@pages/Dashboard/NavBar", () => ({
  NavBar: () => <div data-testid="navbar" />,
}));

describe("Countdown", () => {
  it("Carga los datos iniciales y abre el modal del 25%", async () => {
    render(
      <ChakraProviderWrapper>
        <MemoryRouter>
          <Countdown />
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await waitFor(() => {
      expect(getAsignaturaMock).toHaveBeenCalledWith("asig-1");
      expect(getExamenMock).toHaveBeenCalledWith("exam-1");
      expect(getPartesExamenMock).toHaveBeenCalledWith("exam-1");
      expect(getSesionByIdMock).toHaveBeenCalledWith("ses-1");
    });

    expect(screen.getByText("Matemáticas")).toBeInTheDocument();
    expect(screen.getByText("Tema 1")).toBeInTheDocument();
    expect(screen.getByText("¿Hay alumnos con el 25%?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sí" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });
});