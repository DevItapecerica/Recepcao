import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { activateAccount } from "@Service/Login";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,128}$/;

export default function Activate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token] = useState(() => params.get("token") || "");
  const [activated, setActivated] = useState(false);
  const { control, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { password: "", confirmation: "" } });

  useEffect(() => {
    if (token) window.history.replaceState({}, "", "/Activate");
  }, [token]);

  const submit = async ({ password }) => {
    try { await activateAccount(token, password); setActivated(true); }
    catch (error) { setError("root", { message: error.response?.data?.message || error.message }); }
  };

  if (!token) return <main className="mx-auto w-full max-w-lg px-4 py-12"><Message severity="error" text="Link de ativação inválido" className="w-full" /></main>;

  return <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-12">
    <section className="app-surface w-full p-6 sm:p-8">
      <h1 className="text-2xl font-bold">Ativar conta</h1>
      <p className="mt-2 text-sm text-muted">Defina uma senha com no mínimo 10 caracteres, letra maiúscula, minúscula, número e símbolo.</p>
      {activated ? <div className="mt-6 grid gap-4"><Message severity="success" text="Conta ativada com sucesso" /><Button label="Ir para o login" onClick={() => navigate("/")} /></div> :
      <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-4">
        <label htmlFor="activation-password">Nova senha</label>
        <Controller name="password" control={control} rules={{ required: "Informe a senha", validate: (value) => strongPassword.test(value) || "A senha não atende aos requisitos" }} render={({ field }) => <Password {...field} onChange={(e) => field.onChange(e.target.value)} inputId="activation-password" toggleMask className="w-full" inputClassName={`w-full ${errors.password ? "p-invalid" : ""}`} />} />
        {errors.password && <small className="text-red-600">{errors.password.message}</small>}
        <label htmlFor="activation-confirmation">Confirmar senha</label>
        <Controller name="confirmation" control={control} rules={{ required: "Confirme a senha", validate: (value) => value === watch("password") || "As senhas não coincidem" }} render={({ field }) => <Password {...field} onChange={(e) => field.onChange(e.target.value)} inputId="activation-confirmation" feedback={false} toggleMask className="w-full" inputClassName={`w-full ${errors.confirmation ? "p-invalid" : ""}`} />} />
        {errors.confirmation && <small className="text-red-600">{errors.confirmation.message}</small>}
        {errors.root && <Message severity="error" text={errors.root.message} />}
        <Button type="submit" label="Ativar conta" loading={isSubmitting} disabled={isSubmitting} />
      </form>}
    </section>
  </main>;
}
