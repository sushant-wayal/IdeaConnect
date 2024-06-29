import { createContext, useContext } from 'react';

const UserContext = createContext({
  id: null,
  setId: () => {},
  firstName: null,
  setFirstName: () => {},
  lastName: null,
  setLastName: () => {},
  username: null,
  setUsername: () => {},
  profileImage: null,
  setProfileImage: () => {},
});

export const UserProvider = UserContext.Provider;

export const useUser = () => useContext(UserContext);