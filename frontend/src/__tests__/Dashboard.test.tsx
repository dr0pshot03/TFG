import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Dashboard from "@pages/Dashboard/Dashboard";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";

const navigateMock = vi.fn();
const getUserMock = vi.fn();
const getAsignaturasMock = vi.fn();
const createAsignaturaMock = vi.fn().mockResolvedValue(undefined);
const updateAsignaturaMock = vi.fn().mockResolvedValue(undefined);
const deleteAsignaturaMock = vi.fn().mockResolvedValue(undefined);
const { apiGetMock } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
}));

const mockState = {
  asignaturaModel: {
    asignaturas: [],
  },
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("react-redux", () => ({
  useDispatch: () => ({
    userModel: {
      getUser: getUserMock,
    },
    asignaturaModel: {
      getAsignaturas: getAsignaturasMock,
      createAsignatura: createAsignaturaMock,
      updateAsignatura: updateAsignaturaMock,
      deleteAsignatura: deleteAsignaturaMock,
    },
  }),
  useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ userId: "user-123" }),
  useUser: () => ({ user: { firstName: "Ana", lastName: "López" } }),
}));

vi.mock("@iconify/react", () => ({
  InlineIcon: () => <span data-testid="inline-icon" />,
}));

vi.mock("@pages/Dashboard/NavBar", () => ({
  NavBar: () => <div data-testid="navbar" />,
}));

vi.mock("@/configs/axios", () => ({
  default: {
    get: apiGetMock,
  },
}));

vi.mock("html2canvas", () => ({
  default: vi.fn(),
}));

vi.mock("jspdf", () => ({
  default: vi.fn(),
}));

describe("Dashboard", () => {
  it("Crea una asignatura desde el modal de alta", async () => {
    const user = userEvent.setup();

    render(
      <ChakraProviderWrapper>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </ChakraProviderWrapper>,
    );

    await waitFor(() => {
      expect(getUserMock).toHaveBeenCalledWith("user-123");
      expect(getAsignaturasMock).toHaveBeenCalledWith("user-123");
    });

    await user.click(screen.getByRole("button", { name: "Añadir asignatura" }));

    const nombreInput = await screen.findByPlaceholderText("Introduce el nombre de la asignatura");
    const descripcionInput = await screen.findByPlaceholderText("Introduce la descripción de la asignatura");
    const submitButton = screen.getByRole("button", { name: "Añadir Asignatura" });

    fireEvent.change(nombreInput, { target: { name: "nombre", value: "Matemáticas" } });
    fireEvent.change(descripcionInput, { target: { name: "descripcion", value: "Álgebra y cálculo" } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(createAsignaturaMock).toHaveBeenCalledWith({
        user_id: "user-123",
        nombre: "Matemáticas",
        descripcion: "Álgebra y cálculo",
      });
    });
  });
});