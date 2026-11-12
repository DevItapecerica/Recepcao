import { useEffect, useState } from "react";

import { DataView } from "primereact/dataview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { Image } from "primereact/image";
import { Calendar } from "primereact/calendar";

import { useToast } from "@Context/toast/ToastContext";

import TableHeader from "@/components/table/TableHeader";
import { useVisitorsQuery } from "@/hooks/queries/useVisitors";
import { useDebounce } from "@/hooks/useDebounce";
import { useVisitorOccurrenceStatusQuery } from "@/hooks/queries/useOccurrences";
import { getVisitor } from "@Service/Visitor";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

const toLocalDateValue = (date) => date
  ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  : "";

const printVisitors = (items, title) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  const cards = items.map((visitor) => `
    <article><div class="visitor"><img class="photo" src="${escapeHtml(visitor.photo || "/placeholder.png")}" alt="Foto de ${escapeHtml(visitor.name)}" onerror="this.style.display='none'"/><div><h2>${escapeHtml(visitor.name)}</h2>
      <p><b>E-mail:</b> ${escapeHtml(visitor.email || "—")}</p>
      <p><b>Telefone:</b> ${escapeHtml(visitor.phone || "—")}</p>
      <p><b>Endereço:</b> ${escapeHtml([visitor.address, visitor.city, visitor.state, visitor.zipCode].filter(Boolean).join(", ") || "—")}</p>
      <p><b>Cadastrado em:</b> ${visitor.createdAt ? new Date(visitor.createdAt).toLocaleDateString("pt-BR") : "—"}</p></div></div></article>`).join("");
  printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>
    body{font:14px Arial,sans-serif;color:#111;margin:24px}h1{font-size:20px}article{border:1px solid #bbb;border-radius:6px;padding:12px 16px;margin:12px 0;break-inside:avoid}.visitor{display:flex;gap:16px;align-items:flex-start}.photo{width:105px;height:125px;object-fit:cover;border-radius:4px}h2{font-size:17px;margin:0 0 8px}p{margin:5px 0}@media print{body{margin:12mm}}
    </style></head><body><h1>${escapeHtml(title)}</h1>${cards || "<p>Nenhum visitante encontrado.</p>"}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onafterprint = () => printWindow.close();
  Promise.all(Array.from(printWindow.document.images, (image) => image.decode().catch(() => {})))
    .then(() => { printWindow.focus(); printWindow.print(); });
};

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
        ? "bg-yellow-500"
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
  const [printFrom, setPrintFrom] = useState("");
  const [printTo, setPrintTo] = useState("");

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
            alt="Foto do visitante"
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
            icon="pi pi-print"
            className="p-button-rounded p-button-text"
            onClick={() => printVisitors([data], `Ficha de visitante: ${data.name}`)}
            tooltip="Imprimir visitante"
            tooltipOptions={{ position: "top" }}
          />
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
          <div className="md:flex items-end gap-3">
            <div className="flex flex-col gap-2">
              <small className="text-gray-600">Imprima visitantes cadastrados no período escolhido:</small>
              <div className="flex items-center gap-2">
                <Calendar value={printFrom ? new Date(`${printFrom}T12:00:00`) : null} onChange={(e) => setPrintFrom(toLocalDateValue(e.value))} placeholder="Data inicial" aria-label="Data inicial para impressão" showIcon readOnlyInput dateFormat="dd/mm/yy" />
                <Calendar value={printTo ? new Date(`${printTo}T12:00:00`) : null} onChange={(e) => setPrintTo(toLocalDateValue(e.value))} placeholder="Data final" aria-label="Data final para impressão" showIcon readOnlyInput dateFormat="dd/mm/yy" />
              <Button label="Imprimir período" icon="pi pi-print" severity="secondary" className="h-12 px-5 text-base whitespace-nowrap" disabled={!printFrom || !printTo || printFrom > printTo} onClick={async () => {
                try {
                  const first = await getVisitor(0, 100, query.search);
                  let all = first.visitor || [];
                  const pages = Math.ceil((first.count || 0) / 100);
                  for (let page = 1; page < pages; page += 1) {
                    const result = await getVisitor(page, 100, query.search);
                    all = all.concat(result.visitor || []);
                  }
                  const filtered = all.filter((visitor) => {
                    const day = new Date(visitor.createdAt).toLocaleDateString("en-CA");
                    return day >= printFrom && day <= printTo;
                  });
                  printVisitors(filtered, `Visitantes cadastrados de ${new Date(`${printFrom}T12:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${printTo}T12:00:00`).toLocaleDateString("pt-BR")}`);
                } catch (printError) {
                  showToast("error", "Erro", printError.response?.data?.message || printError.message);
                }
              }} />
              </div>
            </div>
            <Button
              label="Novo visitante"
              icon="pi pi-user-plus"
              className="btn-primary self-end h-12 px-5 text-base whitespace-nowrap"
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
