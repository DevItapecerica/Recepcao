import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Image } from "primereact/image";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { useToast } from "@Context/toast/ToastContext";
import { useAddVisit, useVisitorVisitsQuery } from "@/hooks/queries/useVisits";

const VisitorDetailsModal = ({ visible, setVisible, visitorTarget, setVisitorTarget }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const { showToast } = useToast();
  const historyQuery = useVisitorVisitsQuery(visitorTarget?.uuid, visible);
  const addVisit = useAddVisit();
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { subject: "", date: null } });

  const closeDetails = () => { setVisible(false); setVisitorTarget(null); };
  const submitVisit = async (visit) => {
    try {
      await addVisit.mutateAsync({ visitorUuid: visitorTarget.uuid, visit });
      showToast("success", "Sucesso", "Nova visita registrada!");
      setIsAddModalVisible(false);
      reset();
    } catch (error) {
      showToast("error", "Erro", error.response?.data?.message || error.message);
    }
  };

  return <>
    <Dialog visible={visible} onHide={closeDetails} header="Histórico de visitas" modal className="p-fluid w-3xl" breakpoints={{ "960px": "75vw", "641px": "100vw" }}>
      {visitorTarget && <div className="flex flex-col gap-4">
        <div className="flex items-center p-4 rounded-lg bg-content gap-4">
          <Image src={visitorTarget.photo || "/placeholder.png"} alt={visitorTarget.name} className="w-20 max-h-24 rounded-md object-cover overflow-hidden" preview />
          <div className="flex-1"><h4 className="font-semibold text-lg text-font-secondary">{visitorTarget.name}</h4><p>{visitorTarget.email}</p><p>{visitorTarget.phone}</p></div>
        </div>
        <div className="flex justify-end"><Button label="Adicionar visita" icon="pi pi-plus" className="btn-primary" onClick={() => setIsAddModalVisible(true)} /></div>
        <DataTable value={historyQuery.data?.visits || []} loading={historyQuery.isPending || historyQuery.isFetching} emptyMessage="Nenhuma visita encontrada." className="p-datatable-sm">
          <Column field="subject" header="Assunto" />
          <Column field="date" header="Data e hora" body={(row) => new Date(row.date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} />
        </DataTable>
      </div>}
    </Dialog>
    <Dialog header="Adicionar visita" visible={isAddModalVisible} style={{ width: "30rem" }} modal onHide={() => setIsAddModalVisible(false)}>
      <form onSubmit={handleSubmit(submitVisit)} className="flex flex-col gap-4 p-fluid mt-4">
        <div><label htmlFor="subject" className="font-bold block mb-2">Assunto</label><Controller name="subject" control={control} rules={{ required: "Assunto obrigatório." }} render={({ field, fieldState }) => <InputText id={field.name} {...field} autoFocus className={fieldState.error ? "p-invalid" : ""} />} />{errors.subject && <small className="p-error">{errors.subject.message}</small>}</div>
        <div><label htmlFor="date" className="font-bold block mb-2">Data e hora</label><Controller name="date" control={control} rules={{ required: "Data obrigatória." }} render={({ field, fieldState }) => <Calendar id={field.name} value={field.value} onChange={(event) => field.onChange(event.value)} showTime hourFormat="24" className={fieldState.error ? "p-invalid" : ""} dateFormat="dd/mm/yy" />} />{errors.date && <small className="p-error">{errors.date.message}</small>}</div>
        <div className="flex justify-end gap-2"><Button type="button" label="Cancelar" severity="secondary" onClick={() => setIsAddModalVisible(false)} /><Button type="submit" label="Salvar" className="btn-primary" loading={addVisit.isPending} /></div>
      </form>
    </Dialog>
  </>;
};

export default VisitorDetailsModal;
