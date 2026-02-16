import React from "react"
import ReactDOM from "react-dom/client"
import { Provider as ChakraUIProvider } from "@/components/ui/provider"
import { Provider as ReduxProvider } from "react-redux" 
import { store } from "./store/store" 
import App from "./App"
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ChakraUIProvider>
         <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl={"/login"}>
        <App />
        </ClerkProvider>
      </ChakraUIProvider>
    </ReduxProvider>
  </React.StrictMode>,
)