import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";
import GlobalGraphics from "@pages/Dashboard/GlobalGraphics";

const {
  getAsignaturasMock,
  apiGetMock,
  mockState,
} = vi.hoisted(() => ({
  getAsignaturasMock: vi.fn(),
  apiGetMock: vi.fn().mockResolvedValue({ data: [] }),
  mockState: {
    asignaturaModel: {
      asignaturas: [
        { id: "asig-1", nombre: "Matemáticas" },
      ],
    },
  },
}));

vi.mock("react-redux", () => ({
  useDispatch: () => ({
    asignaturaModel: {
      getAsignaturas: getAsignaturasMock,
    },
  }),
  useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ userId: "user-123" }),
}));

vi.mock("@pages/Dashboard/NavBar", () => ({
  NavBar: () => <div data-testid="navbar" />,
}));

vi.mock("@/configs/axios", () => ({
  default: {
    get: apiGetMock,
  },
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

vi.mock("html2canvas", () => ({
  default: vi.fn(),
}));

vi.mock("jspdf", () => ({
  default: vi.fn(),
}));

describe("GlobalGraphics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiGetMock.mockResolvedValue({ data: [] });
  });

  it("Carga las asignaturas y muestra los controles principales", async () => {
    render(
      <ChakraProviderWrapper>
        <MemoryRouter>
          <GlobalGraphics />
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await waitFor(() => {
      expect(getAsignaturasMock).toHaveBeenCalledWith("user-123");
    });

    expect(screen.getByText("Gráfica Histórica de los Tiempos de Exámenes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtros" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar gráfica" })).toBeInTheDocument();
  });

  it("muestra limpiar filtros tras aplicar filtros", async () => {
    apiGetMock.mockResolvedValueOnce({
      data: [
        {
          id_asign: "asig-1",
          convocatoria: "Febrero",
          fecha_examen: "2026-01-15T00:00:00.000Z",
          duracion_h: 1,
          duracion_m: 30,
          sesion: [{ n_present: 12 }],
        },
      ],
    });

    render(
      <ChakraProviderWrapper>
        <MemoryRouter>
          <GlobalGraphics />
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await waitFor(() => {
      expect(getAsignaturasMock).toHaveBeenCalledWith("user-123");
    });

    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByText("Matemáticas"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Filtrar" }));

    expect(await screen.findByRole("button", { name: "Limpiar filtros" })).toBeInTheDocument();
  });
});