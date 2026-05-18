import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";
import History from "@pages/Dashboard/History";

const {
  navigateMock,
  getAsignaturasMock,
  getHistoricoMock,
  addValueMock,
  searchHistoricoProfesorMock,
  dispatchMock,
  mockState,
} = vi.hoisted(() => {
  const navigateMock = vi.fn();
  const getAsignaturasMock = vi.fn();
  const getHistoricoMock = vi.fn();
  const addValueMock = vi.fn();
  const searchHistoricoProfesorMock = vi.fn();

  return {
    navigateMock,
    getAsignaturasMock,
    getHistoricoMock,
    addValueMock,
    searchHistoricoProfesorMock,
    dispatchMock: {
      historicoModel: {
        addValue: addValueMock,
        getHistorico: getHistoricoMock,
        searchHistoricoProfesor: searchHistoricoProfesorMock,
      },
      asignaturaModel: {
        getAsignaturas: getAsignaturasMock,
      },
    },
    mockState: {
      asignaturaModel: {
        asignaturas: [
          {
            id: "asig-1",
            nombre: "Matemáticas",
          },
        ],
      },
      historicoModel: {
        historico: [
          {
            id: "hist-1",
            id_asignatura: "asig-1",
            curso: "2025/26",
            convocatoria: "Junio",
            tipo_convocatoria: "Ordinaria",
            n_matriculados: 30,
            n_presentados: 24,
            porcentaje_aprobados: 83.33,
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
    useNavigate: () => navigateMock,
  };
});

vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ userId: "user-123" }),
}));

vi.mock("@pages/Dashboard/NavBar", () => ({
  NavBar: () => <div data-testid="navbar" />,
}));

describe("History", () => {
  it("Carga el histórico de mis asignaturas al iniciar y muestra los datos", async () => {
    getHistoricoMock.mockResolvedValueOnce([
      {
        id: "hist-1",
        id_asignatura: "asig-1",
        curso: "2025/26",
        convocatoria: "Junio",
        tipo_convocatoria: "Ordinaria",
        n_matriculados: 30,
        n_presentados: 24,
        porcentaje_aprobados: 83.33,
      },
    ]);

    render(
      <ChakraProviderWrapper>
        <MemoryRouter>
          <History />
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await waitFor(() => {
      expect(addValueMock).toHaveBeenCalledWith({ key: "historico", value: [] });
      expect(getAsignaturasMock).toHaveBeenCalledWith("user-123");
      expect(getHistoricoMock).toHaveBeenCalledWith("asig-1");
    });

    expect(await screen.findByText("Histórico de mis asignaturas")).toBeInTheDocument();
    expect(screen.getByText("Matemáticas")).toBeInTheDocument();
    expect(screen.getByText("2025/26")).toBeInTheDocument();
    expect(screen.getByText("Junio")).toBeInTheDocument();
    expect(screen.getByText("Ordinaria")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("83.33%")).toBeInTheDocument();
  });
});