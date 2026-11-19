import { addLocale, locale } from "primereact/api";

addLocale("pt-BR", {
  firstDayOfWeek: 0,
  dayNames: ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"],
  dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
  dayNamesMin: ["Do", "Se", "Te", "Qu", "Qu", "Se", "Sá"],
  monthNames: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
  monthNamesShort: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  dateFormat: "dd/mm/yy",
  today: "Hoje",
  now: "Agora",
  clear: "Limpar",
  weekHeader: "Sem",
  showMonthAfterYear: false,
  chooseDate: "Escolher data",
  chooseMonth: "Escolher mês",
  chooseYear: "Escolher ano",
  prevMonth: "Mês anterior",
  nextMonth: "Próximo mês",
  prevYear: "Ano anterior",
  nextYear: "Próximo ano",
  prevDecade: "Década anterior",
  nextDecade: "Próxima década",
  prevHour: "Hora anterior",
  nextHour: "Próxima hora",
  prevMinute: "Minuto anterior",
  nextMinute: "Próximo minuto",
  prevSecond: "Segundo anterior",
  nextSecond: "Próximo segundo",
  prevMilliSecond: "Milissegundo anterior",
  nextMilliSecond: "Próximo milissegundo",
  am: "AM",
  pm: "PM",
});

locale("pt-BR");

export const primeReactConfig = { locale: "pt-BR" };
