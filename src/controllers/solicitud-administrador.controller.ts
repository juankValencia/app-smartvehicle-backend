import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Solicitud,
  Administrador,
} from '../models';
import {SolicitudRepository} from '../repositories';

export class SolicitudAdministradorController {
  constructor(
    @repository(SolicitudRepository)
    public solicitudRepository: SolicitudRepository,
  ) { }

  @get('/solicituds/{id}/administrador', {
    responses: {
      '200': {
        description: 'Administrador belonging to Solicitud',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Administrador)},
          },
        },
      },
    },
  })
  async getAdministrador(
    @param.path.string('id') id: typeof Solicitud.prototype.id,
  ): Promise<Administrador> {
    return this.solicitudRepository.administrador(id);
  }
}
