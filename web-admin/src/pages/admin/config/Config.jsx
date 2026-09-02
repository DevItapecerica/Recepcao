import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";

import { useProfile } from "@Context/profile/ProfileContext";
import { useToast } from "@Context/toast/ToastContext";

import { Divider } from "primereact/divider";
import { alterPassword } from "../../../service/Login";

const Config = () => {
  const { showToast } = useToast();
  const { user } = useProfile();

  const { register, control, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      username: user?.name || "",
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Submissão do formulário
  const onSubmit = async (data) => {
    try {
      const response = await alterPassword(data);
      showToast(
        "success",
        "Sucesso",
        response.message || "Senha alterada com sucesso"
      );
      reset({ username: user?.name || "", old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      showToast(
        "error",
        "Erro",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="flex w-full justify-center">
      <div className="app-surface flex w-full max-w-xl flex-col items-center p-6 sm:p-8">
        <div className="h-20 w-20 rounded-full">
          <Avatar
            shape="circle"
            size="xlarge"
            className="w-full h-full flex justify-center items-center"
          >
            <span className="text-5xl">U</span>
          </Avatar>
        </div>
        <Divider />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex flex-col">
            <label htmlFor="username" className="mb-1 font-medium">Usuário</label>
            <InputText
              id="username"
              {...register("username")}
              disabled
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="old_password" className="mb-1 font-medium">Senha atual</label>
            <div className="w-full">
              <Controller
                name="old_password"
                control={control}
                rules={{ required: "Informe a senha atual" }}
                render={({ field }) => (
                  <Password
                    inputId="old_password"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    feedback={false}
                    toggleMask
                    className="w-full"
                    inputClassName="w-full"
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="new_password" className="mb-1 font-medium">Nova senha</label>
            <div className="w-full">
              <Controller
                name="new_password"
                control={control}
                rules={{ required: "Informe a nova senha", minLength: { value: 6, message: "Use pelo menos 6 caracteres" } }}
                render={({ field }) => (
                  <Password
                    inputId="new_password"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    feedback={true}
                    toggleMask
                    className="w-full"
                    inputClassName="w-full"
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="confirm_password" className="mb-1 font-medium">Confirmar nova senha</label>
            <div className="w-full">
              <Controller
                name="confirm_password"
                control={control}
                rules={{ required: "Confirme a nova senha", validate: (value) => value === watch("new_password") || "As senhas não coincidem" }}
                render={({ field }) => (
                  <Password
                    inputId="confirm_password"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    feedback={false}
                    toggleMask
                    className="w-full"
                    inputClassName="w-full"
                  />
                )}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="Alterar senha"
              className="btn-primary w-full"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Config;
