import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ProtectedRoute } from "@components/ProtectedRoute";

const useAuthMock = vi.fn();

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
      <div data-testid="navigate" data-to={to} data-replace={String(Boolean(replace))} />
    ),
  };
});

describe("ProtectedRoute", () => {
  it("Devuelve null mientras carga", () => {
    useAuthMock.mockReturnValue({ isLoaded: false, isSignedIn: false });

    const { container } = render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("redirige al login cuando no hay sesión", () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: false });

    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-replace", "true");
  });

  it("Muestra los hijos cuando la sesión está activa", () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: true });

    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });
});