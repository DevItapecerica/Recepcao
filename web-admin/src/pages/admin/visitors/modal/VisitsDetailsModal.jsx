import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Image } from "primereact/image";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";

import API from "@API/API";
import { useToast } from "@Context/toast/ToastContext";
import { useAddVisit, useVisitorVisitsQuery } from "@/hooks/queries/useVisits";

const VisitorDetailsModal = ({
  visible,
  setVisible,
  visitorTarget,
  setVisitorTarget,
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const { showToast } = useToast();
  const historyQuery = useVisitorVisitsQuery(visitorTarget?.uuid, visible);
  const addVisit = useAddVisit();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject_uuid: null,
      attendant_uuid: null,
      subject: "",
      date: null,
    },
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await API.get("/subjects/");
      return data;
    },
    enabled: isAddModalVisible,
  });

  const attendantsQuery = useQuery({
    queryKey: ["attendants"],
    queryFn: async () => {
      const { data } = await API.get("/attendants/");
      return data;
    },
    enabled: isAddModalVisible,
  });

  const subjects = Array.isArray(subjectsQuery.data)
    ? subjectsQuery.data
    : subjectsQuery.data?.subjects || [];

  const attendants = Array.isArray(attendantsQuery.data)
    ? attendantsQuery.data
    : attendantsQuery.data?.attendants || [];

  const closeAddModal = () => {
    setIsAddModalVisible(false);
    reset();
  };

  const closeDetails = () => {
    closeAddModal();
    setVisible(false);
    setVisitorTarget(null);
  };

  const submitVisit = async (visit) => {
    try {
      await addVisit.mutateAsync({
        visitorUuid: visitorTarget.uuid,
        visit: {
          subject_uuid: visit.subject_uuid,
          attendant_uuid: visit.attendant_uuid || null,
          subject: visit.subject || "",
          date: visit.date,
        },
      });

      showToast("success", "Sucesso", "Nova visita registrada!");
      closeAddModal();
    } catch (error) {
      showToast(
        "error",
        "Erro",
        error.response?.data?.message || error.message,
      );
    }
  };

  return (
    <>
      <Dialog
        visible={visible}
        onHide={closeDetails}
        header="Histórico de visitas"
        modal
        className="p-fluid w-3xl"
        breakpoints={{ "960px": "75vw", "641px": "100vw" }}
      >
        {visitorTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center p-4 rounded-lg bg-content gap-4">
              <Image
                src={visitorTarget.photo || "/placeholder.png"}
                alt={visitorTarget.name}
                className="w-20 max-h-24 rounded-md object-cover overflow-hidden"
                preview
              />
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-font-secondary">
                  {visitorTarget.name}
                </h4>
                <p>{visitorTarget.email}</p>
                <p>{visitorTarget.phone}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                label="Adicionar visita"
                icon="pi pi-plus"
                className="btn-primary"
                onClick={() => setIsAddModalVisible(true)}
              />
            </div>

            <DataTable
              value={historyQuery.data?.visits || []}
              loading={historyQuery.isPending || historyQuery.isFetching}
              emptyMessage="Nenhuma visita encontrada."
              className="p-datatable-sm"
            >
              <Column
                header="Assunto"
                body={(row) =>
                  row.subjectName ||
                  (row.subject_uuid ? "—" : row.subject || "—")
                }
              />

              <Column
                header="Atendente"
                body={(row) => row.attendantName || "—"}
              />

              <Column
                header="Observação"
                body={(row) => (row.subject_uuid ? row.subject || "—" : "—")}
              />
            </DataTable>
          </div>
        )}
      </Dialog>

      <Dialog
        header="Adicionar visita"
        visible={isAddModalVisible}
        style={{ width: "30rem" }}
        modal
        onHide={closeAddModal}
      >
        <form
          onSubmit={handleSubmit(submitVisit)}
          className="flex flex-col gap-4 p-fluid mt-4"
        >
          <div>
            <label htmlFor="subject_uuid" className="font-bold block mb-2">
              Assunto *
            </label>
            <Controller
              name="subject_uuid"
              control={control}
              rules={{ required: "Assunto obrigatório." }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  value={field.value}
                  onChange={(event) => field.onChange(event.value)}
                  options={subjects}
                  optionLabel="name"
                  optionValue="uuid"
                  placeholder="Selecione um assunto"
                  filter
                  showClear
                  loading={subjectsQuery.isLoading}
                  className={fieldState.error ? "p-invalid" : ""}
                />
              )}
            />
            {errors.subject_uuid && (
              <small className="p-error">{errors.subject_uuid.message}</small>
            )}
            {subjectsQuery.isError && (
              <small className="p-error">Erro ao carregar assuntos.</small>
            )}
          </div>

          <div>
            <label htmlFor="attendant_uuid" className="font-bold block mb-2">
              Atendente (opcional)
            </label>
            <Controller
              name="attendant_uuid"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id={field.name}
                  value={field.value}
                  onChange={(event) => field.onChange(event.value)}
                  options={attendants}
                  optionLabel="name"
                  optionValue="uuid"
                  placeholder="Selecione um atendente"
                  filter
                  showClear
                  loading={attendantsQuery.isLoading}
                />
              )}
            />
            {attendantsQuery.isError && (
              <small className="p-error">Erro ao carregar atendentes.</small>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="font-bold block mb-2">
              Observação
            </label>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  id={field.name}
                  {...field}
                  rows={3}
                  autoResize
                  placeholder="Digite uma observação"
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="date" className="font-bold block mb-2">
              Data e hora *
            </label>
            <Controller
              name="date"
              control={control}
              rules={{ required: "Data obrigatória." }}
              render={({ field, fieldState }) => (
                <Calendar
                  id={field.name}
                  value={field.value}
                  onChange={(event) => field.onChange(event.value)}
                  minDate={new Date()}
                  maxDate={new Date()}
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
                  readOnlyInput
                  className={fieldState.error ? "p-invalid" : ""}
                />
              )}
            />
            {errors.date && (
              <small className="p-error">{errors.date.message}</small>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              onClick={closeAddModal}
            />
            <Button
              type="submit"
              label="Salvar"
              className="btn-primary"
              loading={addVisit.isPending}
              disabled={
                subjectsQuery.isLoading ||
                subjectsQuery.isError ||
                subjects.length === 0
              }
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default VisitorDetailsModal;
