import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Image } from "primereact/image";
import { Tag } from "primereact/tag";
import {useVisitorOccurrencesQuery, useVisitorOccurrenceStatusQuery,} from "@/hooks/queries/useOccurrences";
import { useForm, Controller } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { useToast } from "@Context/toast/ToastContext";

import { useOccurrenceTypesQuery,  useAddOccurrence,} from "@/hooks/queries/useOccurrences";

const API_URL = "/api/v1/occurrences";

const OccurrencesModal = ({
  visible,
  setVisible,
  visitorTarget,
  setVisitorTarget,
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const { showToast } = useToast();

const typesQuery = useOccurrenceTypesQuery();
const addOccurrence = useAddOccurrence();

const {
  control,
  handleSubmit,
  watch,
  reset,
  formState: { errors },
} = useForm({
  defaultValues: {
    occurrence_uuid: "",
    severity: null,
    observation: "",
    occurredAt: new Date(),
  },
});

const selectedTypeUuid = watch("occurrence_uuid");

const occurrenceTypes = typesQuery.data?.occurrences || [];

const selectedType = occurrenceTypes.find(
  (type) => type.uuid === selectedTypeUuid
);

const isOther = selectedType?.severity == null;

const closeAddModal = () => {
  setIsAddModalVisible(false);
  reset();
};

const submitOccurrence = async (values) => {
  if (!visitorTarget?.uuid) return;

  const payload = {
    visitor_uuid: visitorTarget.uuid,
    occurrence_uuid: values.occurrence_uuid,
    observation: values.observation,
    occurredAt: values.occurredAt.toISOString(),
  };

  if (isOther) {
    payload.severity = Number(values.severity);
  }

  try {
    await addOccurrence.mutateAsync(payload);

    showToast(
      "success",
      "Sucesso",
      "Ocorrência cadastrada com sucesso!"
    );

    closeAddModal();
  } catch (error) {
    showToast(
      "error",
      "Erro",
      error.response?.data?.message || error.message
    );
  }
};

  const visitorUuid = visitorTarget?.uuid;

  const historyQuery = useVisitorOccurrencesQuery(visitorUuid, visible);

  const statusQuery = useVisitorOccurrenceStatusQuery(visitorUuid, visible);

  const occurrences = historyQuery.data?.occurrences || [];
  const status = statusQuery.data || null;

  const loading = historyQuery.isFetching;

  const error =
    historyQuery.error?.response?.data?.message ||
    statusQuery.error?.response?.data?.message ||
    historyQuery.error?.message ||
    statusQuery.error?.message ||
    "";

  const closeDetails = () => {
    setVisible(false);
    setVisitorTarget(null);
  };

  const severityTemplate = (row) => (
    <Tag
      value={`${row.severity}/5`}
      severity={
        row.severity >= 4 ? "danger" : row.severity >= 3 ? "warning" : "success"
      }
    />
  );

  const dateTemplate = (row) =>
    new Date(row.occurredAt).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <>
      <Dialog
        visible={visible}
        onHide={closeDetails}
        header="Histórico de ocorrências"
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

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Pontuação nos últimos 6 meses</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      status?.points >= 15
                        ? "bg-red-500"
                        : status?.points >= 8
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />
                  <span>
                    {status ? `${status.points} pontos` : "Não carregado"}
                  </span>
                </div>
              </div>

              <Button
                label="Adicionar ocorrência"
                icon="pi pi-plus"
                className="btn-primary"
                onClick={() => setIsAddModalVisible(true)}
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <DataTable
              value={occurrences}
              loading={loading}
              emptyMessage="Nenhuma ocorrência encontrada."
              className="p-datatable-sm"
            >
              <Column
                header="Ocorrência"
                body={(row) => row.Occurrence?.name || "Outros"}
              />
              <Column header="Gravidade" body={severityTemplate} />
              <Column header="Data e hora" body={dateTemplate} />
              <Column field="observation" header="Observação" />
            </DataTable>
          </div>
        )}
      </Dialog>

      
<Dialog
  header="Adicionar ocorrência"
  visible={isAddModalVisible}
  style={{ width: "35rem" }}
  breakpoints={{ "641px": "95vw" }}
  modal
  onHide={closeAddModal}
>
  <form
    onSubmit={handleSubmit(submitOccurrence)}
    className="flex flex-col gap-4 p-fluid mt-4"
  >
    {/* Tipo de ocorrência */}
    <div>
      <label className="font-bold block mb-2">
        Tipo de ocorrência
      </label>

      <Controller
        name="occurrence_uuid"
        control={control}
        rules={{ required: "Selecione uma ocorrência." }}
        render={({ field }) => (
          <Dropdown
            value={field.value}
            onChange={(e) => field.onChange(e.value)}
            options={occurrenceTypes}
            optionLabel="name"
            optionValue="uuid"
            placeholder="Selecione a ocorrência"
            filter
            loading={typesQuery.isLoading}
            className={errors.occurrence_uuid ? "p-invalid" : ""}
          />
        )}
      />

      {errors.occurrence_uuid && (
        <small className="p-error">
          {errors.occurrence_uuid.message}
        </small>
      )}
    </div>

    {/* Gravidade */}
    {selectedType && (
      <div>
        <label className="font-bold block mb-2">
          Gravidade
        </label>

        {isOther ? (
          <>
            <Controller
              name="severity"
              control={control}
              rules={{
                required: "Selecione a gravidade.",
              }}
              render={({ field }) => (
                <Dropdown
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={[1, 2, 3, 4, 5].map((n) => ({
                    label: `Nível ${n}`,
                    value: n,
                  }))}
                  placeholder="Selecione de 1 a 5"
                />
              )}
            />

            {errors.severity && (
              <small className="p-error">
                {errors.severity.message}
              </small>
            )}
          </>
        ) : (
          <div className="p-3 rounded-lg bg-content">
            Nível {selectedType.severity} de 5
          </div>
        )}

        <small className="text-gray-500">
          1 = menos grave | 5 = mais grave
        </small>
      </div>
    )}

    {/* Data e hora */}
    <div>
      <label className="font-bold block mb-2">
        Data e hora
      </label>

      <Controller
        name="occurredAt"
        control={control}
        rules={{ required: "Informe a data." }}
        render={({ field }) => (
          <Calendar
            value={field.value}
            onChange={(e) => field.onChange(e.value)}
            showTime
            hourFormat="24"
            dateFormat="dd/mm/yy"
            maxDate={new Date()}
            showIcon
          />
        )}
      />

      {errors.occurredAt && (
        <small className="p-error">
          {errors.occurredAt.message}
        </small>
      )}
    </div>

    {/* Observação */}
    <div>
      <label className="font-bold block mb-2">
        Observação
      </label>

      <Controller
        name="observation"
        control={control}
        render={({ field }) => (
          <InputTextarea
            {...field}
            rows={4}
            autoResize
            placeholder="Descreva o que aconteceu..."
          />
        )}
      />
    </div>

    {/* Botões */}
    <div className="flex justify-end gap-2 mt-2">
      <Button
        type="button"
        label="Cancelar"
        severity="secondary"
        onClick={closeAddModal}
      />

      <Button
        type="submit"
        label="Salvar ocorrência"
        icon="pi pi-check"
        className="btn-primary"
        loading={addOccurrence.isPending}
      />
    </div>
  </form>
</Dialog>

    </>
  );
};

export default OccurrencesModal;
