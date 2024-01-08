import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, postRequest } from "../utils/service";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registerError, setRegsisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  useEffect(() => {
    const user = localStorage.getItem("User");
    setUser(JSON.parse(user));
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsRegisterLoading(true);
      setRegsisterError(null);
      const response = await postRequest(
        `${baseUrl}/users/register`,
        JSON.stringify(registerInfo)
      );
      setIsRegisterLoading(false);

      if (response.error) return setRegsisterError(response);

      localStorage.setItem("User", JSON.stringify(response));

      setUser(response);
    },
    [registerInfo]
  );

  const loginUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoginLoading(true);
      setLoginError(null);
      const response = await postRequest(
        `${baseUrl}/users/login`,
        JSON.stringify(loginInfo)
      );

      setIsLoginLoading(false);
      if (response.error) {
        return setLoginError(response);
      }
      localStorage.setItem("User", JSON.stringify(response));
      setUser(response);
    },
    [loginInfo]
  );

  const logoutUser = useCallback(() => {
    localStorage.removeItem("User");
    setUser(null);
  }, []);

  const updateRegister = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  const updateLogin = useCallback((info) => {
    setLoginInfo(info);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        registerInfo,
        updateRegister,
        registerUser,
        registerError,
        logoutUser,
        isRegisterLoading,
        loginError,
        loginInfo,
        loginUser,
        updateLogin,
        isLoginLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
