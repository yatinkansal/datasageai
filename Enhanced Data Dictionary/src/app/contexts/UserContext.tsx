import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

const defaultProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
};

interface UserContextValue {
  profile: UserProfile;
  saveProfile: (profile: UserProfile) => void;
}

const STORAGE_KEY = 'datasage_profile';

const UserContext = createContext<UserContextValue>({
  profile: defaultProfile,
  saveProfile: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        if (parsed.firstName && parsed.lastName && parsed.email) {
          setProfile(parsed);
        }
      }
    } catch {
      setProfile(defaultProfile);
    }
  }, []);

  const saveProfile = (next: UserProfile) => {
    setProfile(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  return (
    <UserContext.Provider value={{ profile, saveProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
