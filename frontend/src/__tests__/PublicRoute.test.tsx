import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { PublicRoute } from "@components/PublicRoute";

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

describe("PublicRoute", () => {
  it("devuelve null mientras carga", () => {
    useAuthMock.mockReturnValue({ isLoaded: false, isSignedIn: false });

    const { container } = render(
      <PublicRoute>
        <div>Login público</div>
      </PublicRoute>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("Redirige al dashboard si el usuario ya ha iniciado sesión", () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: true });

    render(
      <PublicRoute>
        <div>Login público</div>
      </PublicRoute>,
    );

    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/dashboard");
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-replace", "true");
  });

  it("muestra el contenido cuando el usuario no está autenticado", () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: false });

    render(
      <PublicRoute>
        <div>Login público</div>
      </PublicRoute>,
    );

    expect(screen.getByText("Login público")).toBeInTheDocument();
  });
});