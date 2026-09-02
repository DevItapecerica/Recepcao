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

// 1. Receba o novo prop "setDetailsIsVisible"
const VisitorsView = ({
  setEditIsVisible,
  setExcludeIsVisible,
  setDetailsIsVisible,
  setVisitorTarget,
}) => {
  const { showToast } = useToast();

  const [query, setQuery] = useState({
    page: 0,
    limit: 10,
    search: null,
  });

  const { data, isPending, isFetching, error } = useVisitorsQuery(query);
  const visitors = data?.visitor || [];
  const totalVisitor = data?.count || 0;

  useEffect(() => {
    if (error) showToast("error", "Erro", error.response?.data?.message || error.message);
  }, [error, showToast]);

  const itemTemplate = (data) => {
    const toEdit = () => {
      setVisitorTarget(data);
      setEditIsVisible(true);
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

    const WarringField = (data) => {
      switch (data.warring) {
        case "secure":
          return <Tag value={data.status} severity={"success"} />;
        case "warning":
          return <Tag value={data.status} severity={"warning"} />;
        case "danger":
          return <Tag value={data.status} severity={"danger"} />;
        default:
          return <Tag value={"unknow"} severity={"info"} />;
      }
    };

    return (
      <div className="flex items-center p-4 border border-gray-200 rounded-lg shadow-sm gap-4">
        <Image
          src={data.photo ? `${data.photo}` : "/placeholder.png"}
          alt="visitor"
          className="w-20 max-h-24 rounded-md object-cover overflow-hidden"
          preview
        />
        <div className="flex-1">
          <h4 className="font-semibold text-lg">
            {data.name} <span className="ml-3">{WarringField(data)}</span>
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
          placeholder="Search by name"
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
              label="New Visitor"
              icon="pi pi-user-plus"
              className="btn-primary"
              onClick={() => setEditIsVisible(true)}
            />
          </div>
        }
        center={<h2 className="text-2xl font-bold">Visitors</h2>}
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
