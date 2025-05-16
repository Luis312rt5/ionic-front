import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { NavController, AlertController, IonModal, DatetimeChangeEventDetail } from '@ionic/angular';
import { Chart, ChartConfiguration, Plugin, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NgForm } from '@angular/forms';
import { IonDatetimeCustomEvent } from '@ionic/core';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  standalone: false
})
export class MovimientosPage implements OnInit {
// Este método se ejecuta cuando el usuario cambia la fecha
onFechaCambio(event: any) {
  const valor = event.detail?.value;
  if (this.mostrarSelector) {
    this.nuevo.fecha = valor;
  } else if (this.mostrarSelectorEditar) {
    this.movimientoSeleccionado.fecha = valor;
  }
}

alCerrarFecha() {
  this.mostrarSelector = false;
  this.mostrarSelectorEditar = false;
}

onFechaBlur() {
throw new Error('Method not implemented.');
}
onFechaChange($event: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) {
throw new Error('Method not implemented.');
}
  movimientos: any[] = [];
  tipoSeleccionado: 'ingreso' | 'gasto' = 'ingreso';
  mostrarModalEditar: boolean = false;
  movimientoSeleccionado: any = {};
  mostrarSelector: boolean = false;
  mostrarSelectorEditar: boolean = false;
  fechaActual: string = new Date().toISOString();
  fechaMaxima: string = new Date().toISOString();

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @ViewChild('modalEditar') modalEditar!: IonModal;
  @ViewChildren('form') form!: QueryList<NgForm>;

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

  nuevo = {
    tipo: 'ingreso',
    cantidad: null,
    descripcion: '',
    fecha: ''
  };

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private navCtrl: NavController,
    private alertController: AlertController
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
    if (!this.nuevo.fecha) {
      this.nuevo.fecha = new Date().toISOString();
    }

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
          this.nuevo = { tipo: 'ingreso', cantidad: null, descripcion: '', fecha: '' };
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

  abrirModalEditar(movimiento: any) {
    this.movimientoSeleccionado = { ...movimiento };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.movimientoSeleccionado = {};
  }

  async actualizarMovimiento() {
    const token = await this.storage.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const { ingresos, gastos } = this.calcularTotales();
    const cantidad = Number(this.movimientoSeleccionado.cantidad || 0);
    const movimientoOriginal = this.movimientos.find(m => m.id === this.movimientoSeleccionado.id);

    let nuevoGastoTotal = gastos;
    let nuevoIngresoTotal = ingresos;

    if (movimientoOriginal.tipo === 'gasto') {
      nuevoGastoTotal -= Number(movimientoOriginal.cantidad || 0);
    } else {
      nuevoIngresoTotal -= Number(movimientoOriginal.cantidad || 0);
    }

    if (this.movimientoSeleccionado.tipo === 'gasto') {
      nuevoGastoTotal += cantidad;
    } else {
      nuevoIngresoTotal += cantidad;
    }

    if (this.movimientoSeleccionado.tipo === 'gasto' && nuevoGastoTotal > nuevoIngresoTotal) {
      const alerta = await this.alertController.create({
        header: 'Gasto no permitido',
        message: 'No puedes registrar más gastos que ingresos.',
        buttons: ['Aceptar']
      });
      await alerta.present();
      return;
    }

    this.http.put(`http://localhost:3000/api/movimientos/${this.movimientoSeleccionado.id}`, this.movimientoSeleccionado, { headers })
      .subscribe({
        next: () => {
          const index = this.movimientos.findIndex(m => m.id === this.movimientoSeleccionado.id);
          if (index !== -1) {
            this.movimientos[index] = { ...this.movimientoSeleccionado };
          }
          this.cerrarModalEditar();
          this.actualizarGrafica();
        },
        error: (err) => console.error('Error al actualizar movimiento', err),
      });
  }
}

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
