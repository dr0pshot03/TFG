import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";

import { ChakraProvider } from "@chakra-ui/react";
import { useAuth } from "@clerk/clerk-react";
import { theme } from "./constants/styles";
//import AppRoutes from "@pages";
import queryClient from "./utils/reactQuery.util";
import { useEffect } from "react";
import { QueryClientProvider } from "react-query";

function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    window.getToken = getToken;
  }, []);
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
