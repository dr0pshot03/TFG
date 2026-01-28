import { BrowserRouter as Router } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@constants/styles";
import AppRoutes from "@pages";

function App() {

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AppRoutes />
      </Router>
    </ChakraProvider>
  );
}


export default App;