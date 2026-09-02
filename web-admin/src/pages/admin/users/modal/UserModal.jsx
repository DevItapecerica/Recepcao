import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useToast } from "@Context/toast/ToastContext";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useSaveUser } from "@/hooks/queries/useUsers";

const rolesOption = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
  { label: "Superadmin", value: "superadmin" },
];

const UserModal = ({ visible, onHide, userTarget, setUserTarget }) => {
  const { showToast } = useToast();
  const saveUser = useSaveUser();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      uuid: null,
      first_name: "",
      last_name: "",
      role: "",
      email: "",
      password: "",
      cpf: "",
    },
    mode: "onBlur",
  });

  // Atualiza formulário ao editar usuário
  useEffect(() => {
    if (userTarget) {
      reset({
        uuid: userTarget.uuid,
        first_name: userTarget.first_name,
        last_name: userTarget.last_name,
        role: userTarget.role,
        email: userTarget.email,
        cpf: userTarget.cpf,
      });
    } else {
      reset({
        uuid: null,
        first_name: "",
        last_name: "",
        role: "",
        email: "",
        cpf: "",
      });
    }
  }, [userTarget, reset]);

  // Submissão do formulário
  const onSubmit = async (data) => {
    try {
      if (userTarget) {
        const { message } = await saveUser.mutateAsync({ user: data, uuid: data.uuid });
        showToast("success", "Sucesso", message || "Atualizado com sucesso");
      } else {
        const { message } = await saveUser.mutateAsync({ user: data });
        showToast("success", "Sucesso", message || "Criado com sucesso");
      }
      handleClose();
    } catch (error) {
      showToast(
        "error",
        "Erro",
        error.response?.data?.message || error.message
      );
    }
  };

  // Fecha modal e reseta formulário
  const handleClose = () => {
    setUserTarget(null);
    reset();
    onHide();
  };

  return (
    <Dialog
      header={userTarget ? "Editar Usuário" : "Cadastro de Usuário"}
      visible={visible}
      style={{ width: "30rem" }}
      onHide={handleClose}
      modal
      className="p-fluid"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Primeiro Nome */}
        <div>
          <label className="font-medium">Primeiro Nome</label>
          <InputText {...register("first_name", { required: "Mandatory" })} />
          {errors.first_name && (
            <small className="text-red-500">{errors.first_name.message}</small>
          )}
        </div>

        {/* Sobrenome */}
        <div>
          <label className="font-medium">Sobrenome</label>
          <InputText {...register("last_name", { required: "Mandatory" })} />
          {errors.last_name && (
            <small className="text-red-500">{errors.last_name.message}</small>
          )}
        </div>

        {/* Função */}
        <div>
          <label className="font-medium">Função</label>
          <Controller
            name="role"
            control={control}
            rules={{ required: "Mandatory" }}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={rolesOption}
                optionLabel="label"
                placeholder="Selecione a função"
                className={errors.role ? "p-invalid" : ""}
                onChange={(e) => field.onChange(e.value)}
                value={field.value}
              />
            )}
          />
          {errors.role && (
            <small className="text-red-500">{errors.role.message}</small>
          )}
        </div>

        {/* E-mail */}
        <div>
          <label className="font-medium">E-mail</label>
          <InputText
            type="email"
            {...register("email", { required: "Mandatory" })}
          />
          {errors.email && (
            <small className="text-red-500">{errors.email.message}</small>
          )}
        </div>

        {/* CPF */}
        <div>
          <label className="font-medium">CPF</label>
          <Controller
            name="cpf"
            control={control}
            rules={{ required: !userTarget ? "Mandatory" : false }}
            render={({ field }) => (
              <InputMask
                {...field}
                mask="999.999.999-99"
                placeholder="000.000.000-00"
                className={errors.cpf ? "p-invalid" : ""}
                onChange={(e) => field.onChange(e.target.value)}
                value={field.value}
                disabled={!!userTarget} // Desabilita edição do CPF ao editar usuário
              />
            )}
          />
          {errors.cpf && (
            <small className="text-red-500">{errors.cpf.message}</small>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Cancelar"
            severity="secondary"
            onClick={handleClose}
            type="button"
          />
          <Button label="Salvar" className="btn-primary" type="submit" loading={saveUser.isPending} />
        </div>
      </form>
    </Dialog>
  );
};

export default UserModal;
