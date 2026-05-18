import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ExamGraphics from "@pages/Dashboard/ExamGraphics";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";

const {
  getExamenesMock,
  getAsignaturaMock,
  html2canvasMock,
  pdfSaveMock,
  pdfAddImageMock,
  pdfTextMock,
  pdfSetFontSizeMock,
  pdfGetTextWidthMock,
  jsPDFMock,
} = vi.hoisted(() => {
  const getExamenesMock = vi.fn();
  const getAsignaturaMock = vi.fn();
  const html2canvasMock = vi.fn();
  const pdfSaveMock = vi.fn();
  const pdfAddImageMock = vi.fn();
  const pdfTextMock = vi.fn();
  const pdfSetFontSizeMock = vi.fn();
  const pdfGetTextWidthMock = vi.fn(() => 120);
  const jsPDFMock = vi.fn(function JsPDFMock(this: unknown) {
    return {
      internal: {
        pageSize: {
          getWidth: () => 842,
          getHeight: () => 595,
        },
      },
      setFontSize: pdfSetFontSizeMock,
      getTextWidth: pdfGetTextWidthMock,
      text: pdfTextMock,
      addImage: pdfAddImageMock,
      save: pdfSaveMock,
    };
  });

  return {
    getExamenesMock,
    getAsignaturaMock,
    html2canvasMock,
    pdfSaveMock,
    pdfAddImageMock,
    pdfTextMock,
    pdfSetFontSizeMock,
    pdfGetTextWidthMock,
    jsPDFMock,
  };
});

const mockState = {
  asignaturaModel: {
    selectedAsignatura: {
      nombre: "Algebra",
    },
  },
  examenModel: {
    examenes: [
      {
        convocatoria: "Febrero",
        fecha_examen: "2024-02-01",
        duracion_h: 2,
        duracion_m: 30,
        sesion: [{ n_present: 10 }],
      },
      {
        convocatoria: "Junio",
        fecha_examen: "2025-06-15",
        duracion_h: 1,
        duracion_m: 0,
        sesion: [{ n_present: 6 }],
      },
    ],
  },
};

vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual<typeof import("@chakra-ui/react")>("@chakra-ui/react");

  return {
    ...actual,
    Checkbox: ({ children, isChecked, onChange }: { children: React.ReactNode; isChecked?: boolean; onChange?: () => void }) => (
      <label>
        <input type="checkbox" checked={Boolean(isChecked)} onChange={onChange} />
        {children}
      </label>
    ),
  };
});

vi.mock("react-redux", () => ({
  useDispatch: () => ({
    examenModel: {
      getExamenes: getExamenesMock,
    },
    asignaturaModel: {
      getAsignatura: getAsignaturaMock,
    },
  }),
  useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock("@clerk/clerk-react", () => ({
  UserButton: () => <div data-testid="user-button" />,
}));

vi.mock("html2canvas", () => ({
  default: html2canvasMock,
}));

vi.mock("jspdf", () => ({
  default: jsPDFMock,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Bar: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

describe("ExamGraphics", () => {
  it("Abre filtros y mantiene la selección aplicada", async () => {
    const user = userEvent.setup();

    render(
      <ChakraProviderWrapper>
        <MemoryRouter initialEntries={["/asignatura/123/grafica"]}>
          <Routes>
            <Route path="/asignatura/:idAsign/grafica" element={<ExamGraphics />} />
          </Routes>
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await user.click(screen.getByRole("button", { name: "Filtros" }));
    await user.click(screen.getByRole("checkbox", { name: "Febrero" }));
    await user.click(screen.getByRole("checkbox", { name: "2024" }));
    await user.click(screen.getByRole("button", { name: "Filtrar" }));

    await user.click(screen.getByRole("button", { name: "Filtros" }));

    expect(await screen.findByRole("checkbox", { name: "Febrero" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "2024" })).toBeChecked();
  });

  it("Exporta la gráfica a PDF", async () => {
    html2canvasMock.mockResolvedValue({
      width: 1200,
      height: 800,
      toDataURL: vi.fn(() => "data:image/png;base64,canvas"),
    });

    const user = userEvent.setup();

    render(
      <ChakraProviderWrapper>
        <MemoryRouter initialEntries={["/asignatura/123/grafica"]}>
          <Routes>
            <Route path="/asignatura/:idAsign/grafica" element={<ExamGraphics />} />
          </Routes>
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await user.click(screen.getByRole("button", { name: "Descargar gráfica" }));

    await waitFor(() => {
      expect(html2canvasMock).toHaveBeenCalled();
    });

    expect(jsPDFMock).toHaveBeenCalledWith({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    expect(pdfAddImageMock).toHaveBeenCalled();
    expect(pdfSaveMock).toHaveBeenCalledWith("grafica-Algebra.pdf");
  });
});