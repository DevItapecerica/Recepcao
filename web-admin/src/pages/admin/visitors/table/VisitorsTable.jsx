import { useEffect, useState } from "react";

import { DataView } from "primereact/dataview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { Image } from "primereact/image";
import { Tag } from "primereact/tag";

import { useToast } from "@Context/toast/ToastContext";

import TableHeader from "@/components/table/TableHeader";
import { useVisitorsQuery } from "@/hooks/queries/useVisitors";
import { useDebounce } from "@/hooks/useDebounce";
import { useVisitorOccurrenceStatusQuery } from "@/hooks/queries/useOccurrences";


const OccurrenceStatusDot = ({ visitorUuid }) => {
  const { data, isLoading, isError } = useVisitorOccurrenceStatusQuery(
    visitorUuid,
    true,
  );

  if (isLoading || isError || !data) return null;

  const points = Number(data.points ?? 0);

  const color =
    points >= 15
      ? "bg-red-500"
      : points >= 8
        ? "bg-yellow-0"
        : "bg-green-500";

  const status =
    points >= 15
      ? { label: "Perigoso", severity: "danger" }
      : points >= 8
        ? { label: "Atenção", severity: "warning" }
        : { label: "Seguro", severity: "success" };

  return (
     <span className="inline-flex items-center gap-2">
    <span
      className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`}
      title={`${points} pontos nos últimos 6 meses`}
    />

    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        points >= 15
          ? "bg-red-200 text-red-600"
          : points >= 8
            ? "bg-yellow-200 text-yellow-600"
            : "bg-green-200 text-green-600"
      }`}
    >
      {status.label}
    </span>
  </span>
  );
};

const VisitorsView = ({
  setEditIsVisible,
  setExcludeIsVisible,
  setDetailsIsVisible,
  setOccurrenceIsVisible,
  setVisitorTarget,
}) => {
  const { showToast } = useToast();

  const [query, setQuery] = useState({
    page: 0,
    limit: 10,
    search: null,
  });

  const search = useDebounce(query.search);
  const { data, isPending, isFetching, error } = useVisitorsQuery({
    ...query,
    search,
  });
  const visitors = data?.visitor || [];
  const totalVisitor = data?.count || 0;

  useEffect(() => {
    if (error)
      showToast(
        "error",
        "Erro",
        error.response?.data?.message || error.message,
      );
  }, [error, showToast]);

  const itemTemplate = (data) => {
    const toEdit = () => {
      setVisitorTarget(data);
      setEditIsVisible(true);
    };

    const showOccurrences = () => {
      setVisitorTarget(data);
      setOccurrenceIsVisible(true);
    };

    const toExclude = () => {
      setVisitorTarget(data);
      setExcludeIsVisible(true);
    };

    // 2. Crie a função para abrir o modal de detalhes
    const showDetails = () => {
      setVisitorTarget(data);
      setDetailsIsVisible(true);
    };

    return (
      <div className="flex items-center gap-4 border-b border-border bg-surface p-4 last:border-b-0">
        <span>
          <Image
            src={data.photo ? `${data.photo}` : "/placeholder.png"}
            alt="visitor"
            className="w-20 max-h-24 rounded-md  overflow-hidden"
            preview
          />
        </span>
        <div className="flex-1">
        <h4 className="font-semibold text-lg flex flex-wrap items-center gap-2">
              <span>{data.name}</span>

            <OccurrenceStatusDot visitorUuid={data.uuid} />
          </h4>

          <p className="text-sm text-gray-600">{data.email}</p>
          <p className="text-sm text-gray-600">{data.phone}</p>

          <p className="text-xs text-gray-400">
            Criado em: {new Date(data.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex gap-2">
          {/* 3. Adicione o botão de detalhes */}
          <Button
            icon="pi pi-list"
            className="p-button-rounded p-button-text"
            onClick={showDetails}
            tooltip="Ver Histórico"
            tooltipOptions={{ position: "top" }}
          />

          <Button
            icon="pi pi-exclamation-triangle"
            className="p-button-rounded p-button-text"
            onClick={showOccurrences}
            tooltip="Ocorrências"
            tooltipOptions={{ position: "top" }}
          />

          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text"
            onClick={toEdit}
            tooltip="Editar"
            tooltipOptions={{ position: "top" }}
          />

          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={toExclude}
            tooltip="Excluir"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>
    );
  };

  return (
    <section>
      {/* O resto do seu componente permanece igual */}
      <div className="p-inputgroup flex-1 pb-4">
        <InputText
          type="search"
          placeholder="Buscar por nome"
          value={query.search || ""}
          onChange={(e) =>
            setQuery((prev) => ({
              ...prev,
              search: e.target.value,
              page: 0,
            }))
          }
          className="w-full px-4 max-w-86"
        />
        <span className="p-inputgroup-addon">
          <i className="pi pi-search" />
        </span>
      </div>

      <TableHeader
        end={
          <div className="md:flex items-center gap-2">
            <Button
              label="Novo visitante"
              icon="pi pi-user-plus"
              className="btn-primary"
              onClick={() => setEditIsVisible(true)}
            />
          </div>
        }
        center={<h2 className="text-2xl font-bold">Visitantes</h2>}
        start={
          <div className="flex items-center gap-4">
            <span>Total de Visitantes: {totalVisitor}</span>
          </div>
        }
      />

      <DataView
        value={visitors}
        itemTemplate={itemTemplate}
        layout="list"
        paginator={false}
        loading={isPending || isFetching}
        emptyMessage="Nenhum visitante encontrado."
      />

      <Paginator
        first={query.page * query.limit}
        rows={query.limit}
        totalRecords={totalVisitor}
        rowsPerPageOptions={[10, 20, 30]}
        onPageChange={(e) =>
          setQuery((prev) => ({
            ...prev,
            page: e.page,
            limit: e.rows,
          }))
        }
      />
    </section>
  );
};

export default VisitorsView;
