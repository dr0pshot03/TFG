import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Image,
  useToast
} from "@chakra-ui/react";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useSignIn,
  useSignUp,
} from "@clerk/clerk-react";

type AuthMode = "signin" | "signup";

import { useNavigate } from "react-router-dom";
import { e } from "node_modules/@clerk/clerk-react/dist/useAuth-BfjxAfMb.d.mts";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [againPassword, setAgainPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");


  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();

  const validarPassword= /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
  const validarEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canSubmit =
    email.trim() !== "" &&
    validarEmail &&
    validarPassword &&
    (mode === "signin" ||
      (name.trim() !== "" && surname.trim() !== "" && againPassword === password));


  const resetStateForMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setIsVerifying(false);
    setCode("");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");


    if (!signInLoaded || !signUpLoaded) return;

    setIsLoading(true);
    try {
      if (mode === "signin") {
        const attempt = await signIn.create({
          identifier: email,
          password,
        });

        if (attempt.status === "complete") {
          await setActiveSignIn({ session: attempt.createdSessionId });
          navigate("/dashboard");
        } else {
          setError("Completa el segundo factor en Clerk.");
        }
        return;
      }

      if (!isVerifying) {
        await signUp.create({
          firstName: name,
          lastName: surname,
          emailAddress: email,
          password,
        });
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setIsVerifying(true);
        return;
      }

      const verification = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (verification.status === "complete") {
        await setActiveSignUp({ session: verification.createdSessionId });
        navigate("/dashboard");
      } else {
        setError("Codigo incorrecto o expirado.");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message
          : "Ocurrio un error. Revisa los datos.";
      setError(message ?? "Ocurrio un error. Revisa los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <Box bg="white">
      <Flex minH="100vh" direction={{ base: "column", md: "row" }}>
        <Box
          w={{ base: "50%", md: "50%" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          py={{ base: 6, md: 0 }}
        >
          <Image src="/time.png" alt="Time" objectFit="contain" maxW="100%" />
        </Box>

        <Box
          w={{ base: "100%", md: "50%" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          py={{ base: 10, md: 0 }}
        >
          <Container maxW="xl" w="100%">
            <SignedOut>
              <Box w="100%" px={2}>
                <Flex justify="center" mb={10}>
                  <Image src="./Logo.png" maxW={"40%"}/>
                </Flex>
                <Flex
                  bg="gray.200"
                  p="4px"
                  borderRadius="full"
                  w="220px"
                  mb={3}
                  mx="auto"
                >
                  <Button
                    flex="1"
                    borderRadius="full"
                    variant="ghost"
                    bg={mode === "signin" ? "white" : "transparent"}
                    boxShadow={mode === "signin" ? "sm" : "none"}
                    onClick={() => resetStateForMode("signin")}
                  >
                    Login
                  </Button>
                  <Button
                    flex="1"
                    borderRadius="full"
                    variant="ghost"
                    bg={mode === "signup" ? "white" : "transparent"}
                    boxShadow={mode === "signup" ? "sm" : "none"}
                    onClick={() => resetStateForMode("signup")}
                  >
                    Sign Up
                  </Button>
                </Flex>

                <Text fontSize="xx-large" fontWeight="bold" mb={3} textAlign="center">
                  {mode === "signin" ? "Bienvenido" : "Crea tu cuenta"}
                </Text>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>

                    {mode === "signup" ? (
                      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Nombre</FormLabel>
                          <Input
                            value={name}
                            borderRadius={10}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Introduce tu nombre"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Apellidos</FormLabel>
                          <Input
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            placeholder="Introduce tus apellidos"
                          />
                        </FormControl>
                      </Stack>
                    ) : null}
                    <FormControl isRequired>
                      <FormLabel>
                        Correo electrónico
                      </FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        placeholder="Tu correo electronico"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>
                        Contraseña
                      </FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Introduce tu contraseña"
                      />
                      {mode === "signup" && !canSubmit && password === "" ? (<Text color={"gray.500"} fontSize={"sm"}>* Asegúrese de que su contraseña contenga un mínimo de 8 letras 
                          con al menos una letra mayúscula, un número y un carácter especial. </Text>) : null}

                      {mode === "signup" && !validarPassword && !canSubmit && password !== "" ? (
                        <Text color="red.500" fontSize="sm">
                          La contraseña debe tener 8+ caracteres, una mayúscula, un número y un símbolo.
                        </Text>
                      ) : null}
                    </FormControl>

                    {mode === "signup" ? (
                     <FormControl isRequired>
                      <FormLabel>
                        Confirmar contraseña
                      </FormLabel>
                      <Input
                        type="password"
                        value={againPassword}
                        onChange={(event) => setAgainPassword(event.target.value)}
                        placeholder="Vuelve a introducir tu contraseña"
                      />
                      {password !== againPassword ? (<Text color={"red"} fontSize={"sm"}>Las contraseñas no coinciden</Text>) : null}
                    </FormControl>) : null}
                   

                    {mode === "signup" && isVerifying ? (
                      <FormControl isRequired>
                        <FormLabel>Codigo de verificacion</FormLabel>
                        <Input
                          value={code}
                          onChange={(event) => setCode(event.target.value)}
                          inputMode="numeric"
                        />  
                      </FormControl>
                    ) : null}
                    

                    {error ? <Text color="red.500">{error}</Text> : null}

                    <Button
                      type="submit"
                      bg="#2563EB"
                      color="white"
                      _hover={{ bg: "gray.300" }}
                      mt={"2"}
                      isDisabled={!canSubmit}
                      isLoading={isLoading}
                      onClick={() => {
                        if (mode === "signup" && !isVerifying) {
                          toast({
                            title: "Se ha enviado el código",
                            description: "Se ha enviado un código a tu correo electrónico, introducelo para verificar.",
                            status: "success",
                            duration: 9000,
                            isClosable: true,
                            position: "top-right",
                            variant: "left-accent",
                          });
                        }
                      }}
                    >
                      {mode === "signin"
                        ? "Entrar"
                        : isVerifying
                        ? "Verificar codigo"
                        : "Registrarme"}
                    </Button>
                  </Stack>
                </form>
              </Box>
            </SignedOut>

            <SignedIn>
              <Flex align="center" justify="center" gap={3}>
                <Text>Sesion iniciada.</Text>
                <UserButton />
              </Flex>
            </SignedIn>
          </Container>
        </Box>
      </Flex>
      
    </Box>
  );
}