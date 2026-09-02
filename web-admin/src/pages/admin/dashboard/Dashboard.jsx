import { useEffect, useState } from "react";
import { Avatar } from "primereact/avatar";
import { ProgressSpinner } from "primereact/progressspinner";
import { useToast } from "@Context/toast/ToastContext";
import { useDashboardQuery } from "@/hooks/queries/useVisits";

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const monthRange = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return {
    dateFrom: `${month}-01`,
    dateTo: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
};

const emptyDashboard = {
  totalVisits: 0,
  uniqueVisitors: 0,
  mostFrequentVisitor: null,
  ranking: [],
  visitsByWeekday: [],
  visitsByHour: [],
};

const MetricCard = ({ icon, label, value, detail }) => (
  <article className="app-surface p-5 flex items-center gap-4 min-h-28">
    <div className="w-12 h-12 rounded-full bg-primary-light text-white flex items-center justify-center">
      <i className={`pi ${icon} text-xl`} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <strong className="block text-2xl text-font-secondary truncate">{value}</strong>
      {detail && <span className="text-sm text-gray-500">{detail}</span>}
    </div>
  </article>
);

const BarChart = ({ title, data, minWidth = "0" }) => {
  const maximum = Math.max(...data.map((point) => point.count), 1);

  return (
    <article className="app-surface p-5 min-w-0">
      <h2 className="text-xl font-semibold text-font-secondary mb-5">{title}</h2>
      <div className="overflow-x-auto">
        <div
          className="h-64 flex items-end gap-2 border-b border-gray-300 pb-2"
          style={{ minWidth }}
          role="img"
          aria-label={title}
        >
          {data.map((point) => (
            <div key={point.label} className="h-full flex-1 flex flex-col justify-end items-center gap-2 min-w-5">
              <span className="text-xs font-semibold text-font-secondary">{point.count}</span>
              <div
                className="w-full max-w-12 rounded-t-md bg-primary-light transition-all duration-300"
                style={{ height: point.count ? `${Math.max((point.count / maximum) * 82, 4)}%` : "2px" }}
                title={`${point.label}: ${point.count} visitas`}
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">{point.label}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth);
  const { showToast } = useToast();
  const period = monthRange(month);
  const { data, isPending, isFetching, error } = useDashboardQuery({ ...period, limit: 5 });
  const dashboard = data?.dashboard || emptyDashboard;
  const loading = isPending || isFetching;

  useEffect(() => {
    if (error) showToast("error", "Erro", error.response?.data?.message || error.message);
  }, [error, showToast]);

  const topVisitor = dashboard.mostFrequentVisitor;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-font-secondary">Dashboard</h1>
          <p className="text-sm">Resumo mensal do movimento da recepção</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Período
          <input
            type="month"
            value={month}
            onChange={(event) => event.target.value && setMonth(event.target.value)}
            required
            className="rounded-lg border border-gray-300 bg-background px-3 py-2 text-font-secondary"
          />
        </label>
      </header>

      {loading ? (
        <div className="min-h-80 flex items-center justify-center">
          <ProgressSpinner aria-label="Carregando dashboard" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard icon="pi-calendar" label="Visitas no mês" value={dashboard.totalVisits} />
            <MetricCard icon="pi-users" label="Visitantes únicos" value={dashboard.uniqueVisitors} />
            <MetricCard
              icon="pi-star"
              label="Quem mais visita"
              value={topVisitor?.name || "Nenhuma visita"}
              detail={topVisitor ? `${topVisitor.visitCount} visitas` : null}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <BarChart title="Visitas por dia da semana" data={dashboard.visitsByWeekday} />
            <BarChart title="Visitas por horário" data={dashboard.visitsByHour} minWidth="720px" />
          </div>

          <article className="app-surface p-5">
            <h2 className="text-xl font-semibold text-font-secondary mb-4">Visitantes mais frequentes</h2>
            {dashboard.ranking.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <i className="pi pi-chart-bar text-3xl block mb-3" />
                Nenhuma visita registrada neste período.
              </div>
            ) : (
              <ol className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboard.ranking.map((visitor, index) => (
                  <li key={visitor.uuid} className="flex items-center gap-4 py-4">
                    <span className="w-7 text-center font-bold text-font-secondary">{index + 1}º</span>
                    <Avatar image={visitor.photo || undefined} icon="pi pi-user" shape="circle" size="large" />
                    <span className="flex-1 min-w-0 font-medium text-font-secondary truncate">{visitor.name}</span>
                    <span className="rounded-full bg-primary-light text-white px-3 py-1 text-sm font-semibold">
                      {visitor.visitCount} {visitor.visitCount === 1 ? "visita" : "visitas"}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </>
      )}
    </section>
  );
}
