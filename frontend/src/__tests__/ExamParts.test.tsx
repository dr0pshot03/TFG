import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";
import ExamParts from "@pages/Dashboard/ExamParts";

const {
  getExamenMock,
  getPartesExamenMock,
  getAsignaturaMock,
  useParamsMock,
  navigateMock,
  mockState,
} = vi.hoisted(() => ({
  getExamenMock: vi.fn(),
  getPartesExamenMock: vi.fn(),
  getAsignaturaMock: vi.fn(),
  useParamsMock: vi.fn(() => ({ id: "exam-1", idAsign: "asig-1" })),
  navigateMock: vi.fn(),
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
        fecha_examen: "2026-05-12T00:00:00.000Z",
        convocatoria: "Junio",
        partes: 1,
        duracion_h: 0,
        duracion_m: 0,
        finalizado: false,
        aulaAlumnos: [],
      },
    },
    parteExamenModel: {
      partesExamenes: [
        {
          id: "parte-1",
          num_parte: 1,
          nombre: "Introducción",
          duracion_h: 0,
          duracion_m: 0,
        },
      ],
    },
  },
}));

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
    examenModel: {
      getExamen: getExamenMock,
    },
    parteExamenModel: {
      getPartesExamen: getPartesExamenMock,
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

describe("ExamParts", () => {
  it("Carga el examen y muestra la tabla de partes", async () => {
    render(
      <ChakraProviderWrapper>
        <MemoryRouter>
          <ExamParts />
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await waitFor(() => {
      expect(getExamenMock).toHaveBeenCalledWith("exam-1");
      expect(getPartesExamenMock).toHaveBeenCalledWith("exam-1");
      expect(getAsignaturaMock).toHaveBeenCalledWith("asig-1");
    });

    expect(screen.getByText("Matemáticas")).toBeInTheDocument();
    expect(screen.getByText(/Fecha:/)).toBeInTheDocument();
    expect(screen.getByText("Introducción")).toBeInTheDocument();
    expect(screen.getByText("Añadir duración parte")).toBeInTheDocument();
  });
});