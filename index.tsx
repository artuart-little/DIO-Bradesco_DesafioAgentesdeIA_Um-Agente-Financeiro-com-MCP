import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { Plug, CheckCircle2, Download, Search, Wallet, Receipt, TrendingUp, Clock, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { cashFlowDist, filterTransactions, toBrl } from "@/lib/audit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conciliador de Caixa - LOTEP | Dashboard" },
      { name: "description", content: "Dashboard de auditoria financeira e conciliação de caixa da Loteria do Estado da Paraíba." },
      { property: "og:title", content: "Conciliador de Caixa - LOTEP" },
      { property: "og:description", content: "Auditoria de transações financeiras sincronizadas via SIAFI/API." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const usd = (n: number) => "US$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const fmtDate = (d: string) => d.split("-").reverse().join("/");
const isoDate = (d: Date) => format(d, "yyyy-MM-dd");

function DateField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  disabled: ComponentProps<typeof Calendar>["disabled"];
}) {
  const calendarProps: ComponentProps<typeof Calendar> = {
    mode: "single",
    initialFocus: true,
    className: cn("p-3 pointer-events-auto"),
    onSelect: (d) => onChange(d),
  };
  if (value) calendarProps.selected = value;
  if (disabled) calendarProps.disabled = disabled;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={label}
          className={cn("w-[150px] justify-start text-left font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar {...calendarProps} />
      </PopoverContent>
    </Popover>
  );
}

function Index() {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<Date | undefined>(new Date(2026, 10, 1));
  const [to, setTo] = useState<Date | undefined>(new Date(2026, 10, 8));

  const rows = useMemo(
    () =>
      filterTransactions({
        q,
        from: from ? isoDate(from) : null,
        to: to ? isoDate(to) : null,
      }),
    [q, from, to],
  );

  const exportCsv = () => {
    const header = "ID de Validação,Status,Data,Descrição,Categoria do Padrão,Valor USD,Valor BRL";
    const lines = rows.map((t) =>
      [t.id, "Conciliado", fmtDate(t.date), `"${t.desc}"`, `"${t.cat}"`, t.usd.toFixed(2), toBrl(t.usd).toFixed(2)].join(","),
    );
    const blob = new Blob(["\uFEFF" + [header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "auditoria-lotep.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV exportado com sucesso");
  };

  const kpis = [
    { label: "Total Gasto", value: "R$ 36.673,76", icon: Wallet },
    { label: "Transações Processadas", value: "31", icon: Receipt },
    { label: "Maior Ticket Identificado", value: "R$ 2.750,65", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Conciliador de Caixa - LOTEP</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Última sincronização: 08/11/2026 às 17:30
            </p>
          </div>
          <Button onClick={() => toast.info("Atualizando base via SIAFI/API...")}>
            <Plug /> Atualizar Base (SIAFI/API)
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{k.label}</p>
                  <p className="mt-2 font-mono text-2xl font-medium text-foreground">{k.value}</p>
                </div>
                <div className="rounded-lg bg-accent p-3 text-primary">
                  <k.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Distribuição de Fluxo de Caixa</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-56 w-full sm:w-1/2">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={cashFlowDist} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {cashFlowDist.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="w-full space-y-3 sm:w-1/2">
                {cashFlowDist.map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-mono text-muted-foreground">{d.value.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Participação por Categoria (%)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <BarChart data={cashFlowDist} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {cashFlowDist.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex flex-col gap-3">
            <CardTitle className="text-base">Auditoria de Transações</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome..." className="w-56 pl-8" />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Data Inicial</span>
                  <DateField label="Data Inicial" value={from} onChange={setFrom} disabled={to ? { after: to } : undefined} />
                </div>
                <span className="pb-2.5 text-muted-foreground">–</span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Data Final</span>
                  <DateField label="Data Final" value={to} onChange={setTo} disabled={from ? { before: from } : undefined} />
                </div>
              </div>
              <Button variant="outline" onClick={exportCsv} className="ml-auto"><Download /> Exportar CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-3 pr-4">ID de Validação</th>
                    <th className="pr-4">Status</th><th className="pr-4">Data</th><th className="pr-4">Descrição</th>
                    <th className="pr-4">Categoria do Padrão</th><th className="pr-4 text-right">Valor USD</th><th className="text-right">Valor BRL</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 pr-4 font-mono text-xs font-medium text-foreground">{t.id}</td>
                      <td className="pr-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Conciliado
                        </span>
                      </td>
                      <td className="pr-4 text-muted-foreground">{fmtDate(t.date)}</td>
                      <td className="pr-4 font-medium text-foreground">{t.desc}</td>
                      <td className="pr-4"><span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{t.cat}</span></td>
                      <td className="pr-4 text-right font-mono">{usd(t.usd)}</td>
                      <td className="text-right font-mono font-medium">{brl(toBrl(t.usd))}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma transação encontrada para a busca ou o período informados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Taxa de câmbio fixa: US$ 1,00 = R$ 5,5013</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
