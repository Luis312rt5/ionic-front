import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: false
})
export class ReportesPage implements OnInit {
  movimientos: any[] = [];
  resumen = {
    ingresos: 0,
    gastos: 0,
    ahorro: 0,
  };

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  periodoSeleccionado: 'diario' | 'semanal' | 'mensual' | 'anual' = 'mensual';

  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Ingresos',
        data: [],
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Gastos',
        data: [],
        backgroundColor: '#FF6384',
      },
      {
        label: 'Ahorro',
        data: [],
        backgroundColor: '#4CAF50',
      }
    ]
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ingresos vs Gastos por Período',
      },
      datalabels: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `$${Number(context.raw).toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private navCtrl: NavController
  ) {
    Chart.register(...registerables);
  }

  async ngOnInit() {
    await this.storage.create();
    const token = await this.storage.get('token');

    if (!token) {
      this.navCtrl.navigateRoot('/login');
      return;
    }

    this.cargarMovimientos();
  }

  async cargarMovimientos() {
    const token = await this.storage.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:3000/api/movimientos', { headers })
      .subscribe({
        next: (data) => {
          this.movimientos = data;
          this.actualizarDatos();
        },
        error: (err) => console.error('Error al obtener movimientos', err),
      });
  }

  actualizarDatos() {
    this.calcularResumen();
    this.actualizarGrafica();
  }

  calcularResumen() {
    let ingresos = 0;
    let gastos = 0;

    const ahora = new Date();
    const inicioPeriodo = new Date();

    switch (this.periodoSeleccionado) {
      case 'diario':
        inicioPeriodo.setHours(0, 0, 0, 0);
        break;
      case 'semanal':
        const diaSemana = ahora.getDay();
        inicioPeriodo.setDate(ahora.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        inicioPeriodo.setHours(0, 0, 0, 0);
        break;
      case 'mensual':
        inicioPeriodo.setDate(1);
        inicioPeriodo.setHours(0, 0, 0, 0);
        break;
      case 'anual':
        inicioPeriodo.setMonth(0, 1);
        inicioPeriodo.setHours(0, 0, 0, 0);
        break;
    }

    const movimientosFiltrados = this.movimientos.filter(mov => {
      const fechaMov = new Date(mov.fecha);
      return fechaMov >= inicioPeriodo && fechaMov <= ahora;
    });

    ingresos = movimientosFiltrados
      .filter(m => m.tipo === 'ingreso')
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

    gastos = movimientosFiltrados
      .filter(m => m.tipo === 'gasto')
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

    this.resumen = {
      ingresos,
      gastos,
      ahorro: ingresos - gastos
    };
  }

  actualizarGrafica() {
    const resumenPorPeriodo: Record<string, { ingreso: number; gasto: number; ahorro: number }> = {};

    for (const mov of this.movimientos) {
      const fecha = new Date(mov.fecha);
      let clave: string;

      switch (this.periodoSeleccionado) {
        case 'diario':
          clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
          break;
        case 'semanal':
          const primerDiaSemana = new Date(fecha);
          const diaSemana = fecha.getDay();
          primerDiaSemana.setDate(fecha.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
          clave = `${primerDiaSemana.getFullYear()}-${String(primerDiaSemana.getMonth() + 1).padStart(2, '0')}-${String(primerDiaSemana.getDate()).padStart(2, '0')}`;
          break;
        case 'mensual':
          clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'anual':
          clave = `${fecha.getFullYear()}`;
          break;
        default:
          clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!resumenPorPeriodo[clave]) resumenPorPeriodo[clave] = { ingreso: 0, gasto: 0, ahorro: 0 };

      if (mov.tipo === 'ingreso') resumenPorPeriodo[clave].ingreso += Number(mov.cantidad);
      if (mov.tipo === 'gasto') resumenPorPeriodo[clave].gasto += Number(mov.cantidad);
    }

    for (const clave in resumenPorPeriodo) {
      resumenPorPeriodo[clave].ahorro = resumenPorPeriodo[clave].ingreso - resumenPorPeriodo[clave].gasto;
      if (resumenPorPeriodo[clave].ahorro < 0) resumenPorPeriodo[clave].ahorro = 0;
    }

    const periodos = Object.keys(resumenPorPeriodo).sort();
    const ingresos = periodos.map(p => resumenPorPeriodo[p].ingreso);
    const gastos = periodos.map(p => resumenPorPeriodo[p].gasto);
    const ahorros = periodos.map(p => resumenPorPeriodo[p].ahorro);

    if (this.chartOptions && this.chartOptions.plugins && this.chartOptions.plugins.title) {
      this.chartOptions.plugins.title.text = `Ingresos vs Gastos por ${this.periodoSeleccionado.charAt(0).toUpperCase()}${this.periodoSeleccionado.slice(1)}`;
    }

    this.chartData.labels = periodos;
    this.chartData.datasets[0].data = ingresos;
    this.chartData.datasets[1].data = gastos;
    this.chartData.datasets[2].data = ahorros;

    this.chart?.update();
  }

  cambiarPeriodo(event: CustomEvent) {
    const nuevoPeriodo = event.detail.value as 'diario' | 'semanal' | 'mensual' | 'anual';
    if (nuevoPeriodo) {
      this.periodoSeleccionado = nuevoPeriodo;
      this.actualizarDatos();
    }
  }

  async cerrarSesion() {
    await this.storage.remove('token');
    await this.storage.remove('userId');
    this.navCtrl.navigateRoot('/login');
  }
}
