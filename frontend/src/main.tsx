import React from "react"
import ReactDOM from "react-dom/client"
import { Provider as ChakraUIProvider } from "@/components/ui/provider"
import { Provider as ReduxProvider } from "react-redux" 
import { store } from "./store/store" 
import App from "./App"
import './index.css'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ChakraUIProvider>
        <App />
      </ChakraUIProvider>
    </ReduxProvider>
  </React.StrictMode>,
)