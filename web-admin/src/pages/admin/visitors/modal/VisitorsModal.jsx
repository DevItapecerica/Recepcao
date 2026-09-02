import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

import { useToast } from "@Context/toast/ToastContext";
import { useSaveVisitor } from "@/hooks/queries/useVisitors";

import UploadFile from "./uploadFile/upload/UploadFile";

const VisitorsModal = ({ visible, onHide, visitorTarget, setVisitorTarget }) => {
  const [CEP, setCEP] = useState("");
  const [photoBase64, setPhotoBase64] = useState(null);

  const { showToast } = useToast();
  const saveVisitor = useSaveVisitor();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    uuid: null,
    name: null,
    cpf: null,
    photo: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Preenche formulário em caso de edição
  useEffect(() => {
    if (visitorTarget) {
      reset({
        uuid: visitorTarget.uuid,
        name: visitorTarget.name || "",
        photo: visitorTarget.photo || "",
        waring: visitorTarget.waring || "secure",
        cpf: visitorTarget.cpf || "",
        email: visitorTarget.email || "",
        phone: visitorTarget.phone || "",
        address: visitorTarget.address || "",
        city: visitorTarget.city || "",
        state: visitorTarget.state || "",
        zipCode: visitorTarget.zipCode || "",
      });
    } else {
      reset();
    }
  }, [visitorTarget, reset]);

  // Autopreenche endereço via ViaCEP
  useEffect(() => {
    const cep = CEP.replace(/\D/g, "");

    if (cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            setValue("address", data.logradouro || "");
            setValue("city", data.localidade || "");
            setValue("state", data.uf || "");
            setValue("zipCode", data.cep || "");
          } else {
            showToast("error", "Erro", "CEP não encontrado");
          }
        })
        .catch((err) => {
          showToast("error", "Erro", "Erro ao buscar CEP: " + err.message);
        });
    }
  }, [CEP, setValue, showToast]);

  useEffect(() => {
    setValue("photo", photoBase64 || "");
  }, [photoBase64, setValue]);

  const onSubmit = async (data) => {
    try {
      if (visitorTarget) {
        const { message } = await saveVisitor.mutateAsync({ visitor: data, uuid: data.uuid });
        setPhotoBase64(null);
        showToast("success", "Sucesso", message || "Visitante atualizado");
      } else {
        const { message } = await saveVisitor.mutateAsync({ visitor: data });
        showToast("success", "Sucesso", message || "Visitante criado");
      }
      handleClose();
    } catch (err) {
      showToast("error", "Erro", err.response?.data?.message || err.message);
    }
  };

  const handleClose = () => {
    setVisitorTarget(null);
    setPhotoBase64(null);
    reset({
      defaultValues: {
        uuid: null,
        name: "",
        cpf: "",
        photo: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
    });
    onHide();
  };

  const header = (
    <div className="flex items-center gap-3">
      <i className="pi pi-pencil text-2xl text-font-secondary" />
      <span className="text-xl font-bold text-font-secondary">
        {visitorTarget ? "Editar Visitante" : "Cadastro de Visitante"}
      </span>
    </div>
  );

  return (
    <Dialog
      header={header}
      visible={visible}
      onHide={handleClose}
      modal
      className="p-fluid w-3xl"
      breakpoints={{ "960px": "75vw", "641px": "100vw" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-row flex-wrap sm:gap-4 gap-2"
      >
        {/* Upload de Foto */}
        <div className="w-full sm:w-[50%] m-auto">
          <label className="font-medium">Foto</label>
          <UploadFile
            setPhotoBase64={setPhotoBase64}
            photo={photoBase64 || visitorTarget?.photo || null}
          />
        </div>

        {/* Nome */}
        <div className="md:w-[57%] sm:w-[48.5%] w-full">
          <label className="font-medium">Nome</label>
          <InputText
            {...register("name", { required: "Obrigatório" })}
          />
          {errors.name && (
            <small className="text-red-500">{errors.name.message}</small>
          )}
        </div>

        {/* CPF */}
        <div className="md:w-[40%] sm:w-[48.5%] w-full">
          <label className="font-medium">CPF</label>
          <Controller
            name="cpf"
            control={control}
            rules={{ required: !visitorTarget ? "Obrigatório" : false }}
            render={({ field }) => (
              <InputMask
                {...field}
                mask="999.999.999-99"
                placeholder="***.***.***-**"
                onChange={(e) => field.onChange(e.target.value)}
                value={field.value}
                disabled={!!visitorTarget}
              />
            )}
          />
          {errors.cpf && (
            <small className="text-red-500">{errors.cpf.message}</small>
          )}
        </div>

        {/* Email */}
        <div className="md:w-[48.5%] sm:w-[60%] w-full">
          <label className="font-medium">E-mail</label>
          <InputText type="email" {...register("email")} />
        </div>

        {/* Telefone */}
        <div className="md:w-[48.5%] sm:w-[37%] w-full">
          <label className="font-medium">Telefone</label>
          <InputText {...register("phone")} />
        </div>

        <Divider />

        {/* CEP */}
        <div className="sm:w-[30%] w-[80%]">
          <label className="font-medium">CEP</label>
          <Controller
            name="zipCode"
            control={control}
            render={({ field }) => (
              <InputMask
                onChange={(e) => {
                  setCEP(e.target.value);
                }}
                mask="99999-999"
                maxLength={9}
                value={field.value}
                placeholder="CEP"
              />
            )}
          />
        </div>

        {/* Endereço */}
        <div className="sm:w-[67%] w-full">
          <label className="font-medium">Endereço</label>
          <InputText {...register("address")} disabled />
        </div>

        {/* Cidade */}
        <div className="sm:w-[48.5%] w-full">
          <label className="font-medium">Cidade</label>
          <InputText {...register("city")} disabled />
        </div>

        {/* Estado */}
        <div className="sm:w-[48.5%] w-full">
          <label className="font-medium">Estado</label>
          <InputText {...register("state")} disabled />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 mt-4 w-full">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            className="w-[50%]"
            onClick={handleClose}
          />
          <Button
            type="submit"
            label="Salvar"
            className="btn-primary w-[50%]"
            loading={saveVisitor.isPending}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default VisitorsModal;
