import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {Administrador} from './administrador.model';
import {Asesor} from './asesor.model';
import {Cliente} from './cliente.model';
import {Vehiculo} from './vehiculo.model';

@model()
export class Solicitud extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'date',
    required: true,
  })
  fecha: string;

  @property({
    type: 'string',
    required: true,
  })
  tiposolicitud: string;

  @belongsTo(() => Cliente)
  clienteId: string;

  @belongsTo(() => Asesor)
  asesorId: string;

  @belongsTo(() => Administrador)
  administradorId: string;

  @hasOne(() => Vehiculo)
  vehiculo: Vehiculo;

  @property({
    type: 'string',
    required: false,
  })
  vehiculoId?: string;

  constructor(data?: Partial<Solicitud>) {
    super(data);
  }
}

export interface SolicitudRelations {
  // describe navigational properties here
}

export type SolicitudWithRelations = Solicitud & SolicitudRelations;
