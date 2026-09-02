import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";

import { useProfile } from "../context/profile/ProfileContext";
import { useAuth } from "../context/auth/AuthContext";

import { useNavigate } from "react-router-dom";

import { handdleLogin } from "@Service/Login";

import { useToast } from "@Context/toast/ToastContext";

export default function Login() {
  const { attImage, attUser } = useProfile();
  const { Login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  /* ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { username: "", password: "" },
  });

  /* ------------------------------------------------------------------ */
  const onSubmit = async (credentials) => {
    try {
      const { token, user } = await handdleLogin(
        credentials.username,
        credentials.password
      );
      Login(token);
      attUser(user);
      attImage(null);
      navigate("/Admin");
    } catch (error) {
      showToast("error", "Erro", error.response?.data?.message || error.message);
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <div id="Login" className="flex justify-center items-center h-full w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-window rounded-md p-4 shadow-2xl"
      >
        <h1 className="text-6xl text-center mb-4">Login</h1>

        {/* ---------------------- USERNAME ---------------------- */}
        <div className="p-inputgroup flex-1 mb-4">
          <span className="p-inputgroup-addon">
            <i className="pi pi-user" />
          </span>

          <Controller
            name="username"
            control={control}
            rules={{ required: "Usuário obrigatório" }}
            render={({ field }) => (
              <InputText
                placeholder="Username"
                className={errors.username ? "p-invalid flex-1" : "flex-1"}
                {...field}
              />
            )}
          />
        </div>
        {errors.username && (
          <small className="text-red-600 block -mt-3 mb-3">
            {errors.username.message}
          </small>
        )}

        {/* ---------------------- PASSWORD ---------------------- */}
        <div className="p-inputgroup flex-1 mb-6">
          <span className="p-inputgroup-addon">*</span>

          <Controller
            name="password"
            control={control}
            rules={{
              required: "Senha obrigatória",
              minLength: { value: 6, message: "Mínimo de 6 caracteres" },
            }}
            render={({ field }) => (
              <Password
                feedback={false}
                toggleMask
                className={errors.password ? "p-invalid w-full" : "w-full"}
                {...field}
              />
            )}
          />
        </div>
        {errors.password && (
          <small className="text-red-600 block -mt-5 mb-3">
            {errors.password.message}
          </small>
        )}

        {/* ---------------------- SUBMIT ------------------------ */}
        <Button
          label={"Login"}
          type="submit"
          className="btn-primary w-full"
          disabled={isSubmitting}
        />
      </form>
    </div>
  );
}
