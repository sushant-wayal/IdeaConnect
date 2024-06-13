import {
  createContext,
  useContext
} from "react";

const IdeasContext = createContext({
  originalIdeas: [],
  setOriginalIdeas: () => {},
  ideas: [],
  setIdeas: () => {}
})

export const IdeasProvider = IdeasContext.Provider;

export const useIdeas = () => {
  return useContext(IdeasContext);
}