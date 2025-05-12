import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { NavController, AlertController } from '@ionic/angular';
import { Chart, ChartConfiguration, Plugin, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Importa el plugin

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  standalone: false
})
export class MovimientosPage implements OnInit {
  movimientos: any[] = [];
  tipoSeleccionado: 'ingreso' | 'gasto' = 'ingreso';

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  chartType: any = 'doughnut';

  chartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0']
    }]
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((sum: number, val: any) => sum + Number(val), 0);
            const value = Number(context.raw);
            const percentage = total ? (value / total) * 100 : 0;
            return `${context.label}: $${value.toFixed(2)} (${percentage.toFixed(1)}%)`;
          }
        }
      },
      datalabels: {
        display: false
      }
    }
  };

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private navCtrl: NavController,
    private alertController: AlertController // 👈 Importado aquí
  ) {
    Chart.register(...registerables);
    Chart.register(ChartDataLabels);
    Chart.register(centerTextPlugin);
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

  async cerrarSesion() {
    await this.storage.remove('token');
    await this.storage.remove('userId');
    this.navCtrl.navigateRoot('/login');
  }

  nuevo = {
    tipo: 'ingreso',
    cantidad: null,
    descripcion: ''
  };

  // ✅ NUEVO: Calcula ingresos y gastos totales
  calcularTotales() {
    const ingresos = this.movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

    const gastos = this.movimientos
      .filter(m => m.tipo === 'gasto')
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

    return { ingresos, gastos };
  }

  async agregarMovimiento() {
    const token = await this.storage.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const { ingresos, gastos } = this.calcularTotales();
    const cantidad = Number(this.nuevo.cantidad || 0);

    if (this.nuevo.tipo === 'gasto' && (gastos + cantidad > ingresos)) {
      const alerta = await this.alertController.create({
        header: 'Gasto no permitido',
        message: 'No puedes registrar más gastos que ingresos.',
        buttons: ['Aceptar']
      });
      await alerta.present();
      return;
    }

    this.http.post('http://localhost:3000/api/movimientos', this.nuevo, { headers })
      .subscribe({
        next: () => {
          this.nuevo = { tipo: 'ingreso', cantidad: null, descripcion: '' };
          this.cargarMovimientos();
        },
        error: (err) => console.error('Error al agregar movimiento', err),
      });
  }

  async cargarMovimientos() {
    const token = await this.storage.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:3000/api/movimientos', { headers })
      .subscribe({
        next: (data) => {
          this.movimientos = data;
          this.actualizarGrafica();
        },
        error: (err) => console.error('Error al obtener movimientos', err),
      });
  }

  cambiarTipo(tipo: 'ingreso' | 'gasto') {
    this.tipoSeleccionado = tipo;
    this.actualizarGrafica();
  }

  actualizarGrafica() {
    const filtrados = this.movimientos.filter(m => m.tipo === this.tipoSeleccionado);
    const agrupados = filtrados.reduce((acc, m) => {
      const descripcion = m.descripcion || 'Sin descripción';
      const cantidad = Number(m.cantidad) || 0;
      acc[descripcion] = (acc[descripcion] || 0) + cantidad;
      return acc;
    }, {} as Record<string, number>);

    this.chartData.labels = Object.keys(agrupados);
    this.chartData.datasets[0].data = Object.values(agrupados);

    this.chart?.update();
  }

  eliminarMovimiento(id: number) {
    this.storage.get('token').then(token => {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:3000/api/movimientos/${id}`, { headers })
        .subscribe({
          next: () => {
            this.movimientos = this.movimientos.filter(m => m.id !== id);
            this.actualizarGrafica();
          },
          error: (err) => console.error('Error al eliminar movimiento', err),
        });
    });
  }
}

// Plugin personalizado para mostrar el total en el centro
const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'centerText',
  beforeDraw: (chart) => {
    const { width, height } = chart;
    const ctx = chart.ctx;
    const total = chart.data.datasets[0].data.reduce((a: any, b: any) => a + Number(b), 0);

    ctx.save();
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(`$${total.toFixed(2)}`, width / 2, height / 2);
    ctx.restore();
  }
};
