import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";
import Subject from "@pages/Dashboard/Subject";

const {
  navigateMock,
  getExamenesMock,
  getAsignaturaMock,
  useParamsMock,
  dispatchMock,
  mockState,
} = vi.hoisted(() => {
  const navigateMock = vi.fn();
  const getExamenesMock = vi.fn();
  const getAsignaturaMock = vi.fn();
  const useParamsMock = vi.fn(() => ({ id: "asig-1" }));

  return {
    navigateMock,
    getExamenesMock,
    getAsignaturaMock,
    useParamsMock,
    dispatchMock: {
      examenModel: {
        getExamenes: getExamenesMock,
      },
      asignaturaModel: {
        getAsignatura: getAsignaturaMock,
      },
      parteExamenModel: {
        getPartesExamen: vi.fn(),
      },
      sesionModel: {
        getSesion: vi.fn(),
      },
      historicoModel: {
        updateHistorico: vi.fn(),
      },
    },
    mockState: {
      asignaturaModel: {
        selectedAsignatura: {
          id: "asig-1",
          nombre: "Matemáticas",
          descripcion: "Álgebra y cálculo",
        },
      },
      examenModel: {
        examenes: [],
      },
    },
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useParams: () => useParamsMock(),
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

vi.mock("@iconify/react", () => ({
  InlineIcon: () => <span data-testid="inline-icon" />,
}));

describe("Subject", () => {
  it("Carga la asignatura y muestra el estado vacío de exámenes", async () => {
    render(
      <ChakraProviderWrapper>
        <MemoryRouter>
          <Subject />
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await waitFor(() => {
      expect(getExamenesMock).toHaveBeenCalledWith("asig-1");
      expect(getAsignaturaMock).toHaveBeenCalledWith("asig-1");
    });

    expect(screen.getByText("Matemáticas")).toBeInTheDocument();
    expect(screen.getByText("Álgebra y cálculo")).toBeInTheDocument();
    expect(screen.getByText("Ups, parece que tu lista de examenes está vacía.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Añadir examen" })).toBeInTheDocument();
  });
});