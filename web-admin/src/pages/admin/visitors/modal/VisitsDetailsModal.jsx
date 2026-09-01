// ALTERADO: Importações adicionadas
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Image } from "primereact/image";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { useToast } from "@Context/toast/ToastContext";

import { useVisitors } from "@Context/visitors/VisitorsContext";
import { addVisits, getVisitsByVisitorId } from "../../../../service/Visits";

const addVisitorHistory = async (visitorId, newVisit) => {
  const response = await addVisits(visitorId, newVisit);

  // Em um caso real, a API retornaria o objeto salvo com um ID.
  return response;
};

const VisitorDetailsModal = ({ visible, setVisible }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // NOVO: Estado para controlar a visibilidade do modal de adicionar visita
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // NOVO: Configuração do React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { subject: "", date: null },
  });

  // 3. Obtenha o visitante alvo do contexto
  const { visitorTarget, setVisitorTarget } = useVisitors();

  const onHide = () => {
    setVisible(false);
    setVisitorTarget(null); // Limpa o visitante alvo ao fechar
  };

  const getVisitorHistory = async (visitorId) => {
    try {
      const response = await getVisitsByVisitorId(visitorId);

      setHistory(response.visits);
      setLoading(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visitorTarget) {
      setLoading(true);
      getVisitorHistory(visitorTarget.uuid);
    }
  }, [visitorTarget]);

  // NOVO: Função chamada ao submeter o formulário de nova visita
  const onSubmitNewVisit = async (formData) => {
    try {
      const newVisit = await addVisitorHistory(visitorTarget.uuid, formData);
      setHistory((prevHistory) => [...prevHistory, newVisit]); // Adiciona à tabela
      showToast("success", "Sucesso", "Nova visita registrada!");
      setIsAddModalVisible(false); // Fecha o modal de adição
      reset({ subject: "", date: null }); // Limpa o formulário
    } catch (error) {
      showToast("error", "Erro", "Não foi possível registrar a visita. ");
    }
  };

  const header = (
    <div className="flex items-center gap-3">
      <i className="pi pi-list text-2xl text-font-secondary" />
      <span className="text-xl font-bold text-font-secondary">
        Visits history
      </span>
    </div>
  );

  const footer = (
    <div>
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text btn-primary"
      />
    </div>
  );

  const formatDate = (rowData) => {
    return new Date(rowData.date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <>
      <Dialog
        visible={visible}
        onHide={onHide}
        header={header}
        footer={footer}
        modal
        className="p-fluid w-3xl"
        breakpoints={{ "960px": "75vw", "641px": "100vw" }}
      >
        {visitorTarget && (
          <div className="flex flex-col gap-4">
            {/* Informações do Visitante */}
            <div className="flex items-center p-4 rounded-lg bg-content gap-4">
              <Image
                src={
                  visitorTarget.photo
                    ? `${visitorTarget.photo}`
                    : "/placeholder.png"
                }
                alt="visitor"
                className="w-20 max-h-24 rounded-md object-cover overflow-hidden"
                preview
              />
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-font-secondary">
                  {visitorTarget.name}
                </h4>
                <p className="text-sm text-font-primary">
                  {visitorTarget.email}
                </p>
                <p className="text-sm text-font-primary">
                  {visitorTarget.phone}
                </p>
              </div>
            </div>

            {/* NOVO: Botão para abrir o modal de adição */}
            <div className="flex justify-end">
              <Button
                label="Add Visit"
                icon="pi pi-plus"
                className="btn-primary"
                onClick={() => setIsAddModalVisible(true)}
              />
            </div>

            {/* Tabela de Histórico */}
            <div className="max-h-[300px] overflow-y-scroll">
              <DataTable
                value={history}
                loading={loading}
                emptyMessage="No registers found."
                className="p-datatable-sm"
              >
                <Column field="subject" header="Subject"></Column>
                <Column
                  field="date"
                  header="Date and hour"
                  body={formatDate}
                  style={{ width: "180px" }}
                ></Column>
              </DataTable>
            </div>
          </div>
        )}
      </Dialog>
      {/* NOVO: Modal para adicionar uma nova visita */}
      <Dialog
        header="Add New Visit"
        visible={isAddModalVisible}
        style={{ width: "30rem" }}
        modal
        onHide={() => setIsAddModalVisible(false)}
      >
        <form
          onSubmit={handleSubmit(onSubmitNewVisit)}
          className="flex flex-col gap-4 p-fluid mt-4"
        >
          <div>
            <label htmlFor="subject" className="font-bold block mb-2">
              Subject
            </label>
            <Controller
              name="subject"
              control={control}
              rules={{ required: "The subject is obrigatory." }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  autoFocus
                  className={fieldState.error ? "p-invalid" : ""}
                />
              )}
            />
            {errors.subject && (
              <small className="p-error">{errors.subject.message}</small>
            )}
          </div>

          <div>
            <label htmlFor="date" className="font-bold block mb-2">
              Date and Hour
            </label>
            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is obrigatory." }}
              render={({ field, fieldState }) => (
                <Calendar
                  id={field.name}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.value);
                  }}
                  showTime
                  hourFormat="24"
                  className={fieldState.error ? "p-invalid" : ""}
                  dateFormat="dd/mm/yy"
                />
              )}
            />
            {errors.date && (
              <small className="p-error">{errors.date.message}</small>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              onClick={() => setIsAddModalVisible(false)}
            />
            <Button type="submit" label="Salvar" className="btn-primary" />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default VisitorDetailsModal;
