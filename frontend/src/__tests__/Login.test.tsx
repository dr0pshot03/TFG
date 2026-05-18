import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Login from "@pages/Auth/Login";
import { Provider as ChakraProviderWrapper } from "@/components/ui/provider";

const navigateMock = vi.fn();
const toastMock = vi.fn();
const signInCreateMock = vi.fn();
const setActiveSignInMock = vi.fn();
const signUpCreateMock = vi.fn();
const signUpPrepareVerificationMock = vi.fn();
const signUpAttemptVerificationMock = vi.fn();
const setActiveSignUpMock = vi.fn();
const updateUsuarioMock = vi.fn().mockResolvedValue(undefined);

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
      updateUsuario: updateUsuarioMock,
      createUsuario: vi.fn().mockResolvedValue(undefined),
    },
  }),
}));

vi.mock("@clerk/clerk-react", () => ({
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    userId: "clerk-123",
    getToken: vi.fn().mockResolvedValue(null),
  }),
  useSignIn: () => ({
    signIn: {
      create: signInCreateMock,
      attemptFirstFactor: vi.fn(),
    },
    setActive: setActiveSignInMock,
    isLoaded: true,
  }),
  useSignUp: () => ({
    signUp: {
      create: signUpCreateMock,
      prepareEmailAddressVerification: signUpPrepareVerificationMock,
      attemptEmailAddressVerification: signUpAttemptVerificationMock,
    },
    setActive: setActiveSignUpMock,
    isLoaded: true,
  }),
  useUser: () => ({ user: null }),
  useToast: () => toastMock,
}));

describe("Login", () => {
  it("Envía el login y navega al dashboard cuando Clerk responde correctamente", async () => {
    signInCreateMock.mockResolvedValue({
      status: "complete",
      createdSessionId: "session-123",
      userData: {
        firstName: "Ada",
        lastName: "Lovelace",
      },
    });

    const user = userEvent.setup();

    render(
      <ChakraProviderWrapper>
        <Login />
      </ChakraProviderWrapper>,
    );

    fireEvent.change(screen.getByPlaceholderText("Tu correo electronico"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Introduce tu contraseña"), {
      target: { value: "Abcd1234!" },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Entrar" })).not.toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(signInCreateMock).toHaveBeenCalledWith({
        identifier: "ada@example.com",
        password: "Abcd1234!",
      });
    });

    expect(setActiveSignInMock).toHaveBeenCalledWith({ session: "session-123" });
    expect(updateUsuarioMock).toHaveBeenCalledWith({
      clerkId: "clerk-123",
      nombre: "Ada",
      apellidos: "Lovelace",
      email: "ada@example.com",
    });
    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });
});