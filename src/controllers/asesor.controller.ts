import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Llaves} from '../config/llaves';
import {Asesor} from '../models';
import {Credenciales} from '../models/credenciales.model';
import {AsesorRepository} from '../repositories';
import {autenticacionService} from '../services';
const fetch = require("node-fetch");

@authenticate("admin")
export class AsesorController {
  constructor(
    @repository(AsesorRepository)
    public asesorRepository: AsesorRepository,
    @service(autenticacionService)
    public servicioAutenticacion: autenticacionService
  ) { }

  @authenticate.skip()
  @post("/IdentificarAsesor", {
    responses: {
      "200": {
        description: "Identificacion de usuario"
      }
    }
  })
  async identificarAdmin(
    @requestBody() credenciales: Credenciales
  ) {
    let p = await this.servicioAutenticacion.IdentificarAsesor(credenciales.usuario, credenciales.contrasena);
    if (p) {
      let token = this.servicioAutenticacion.GenerarTokenAsesorJWT(p);
      return {
        datos: {
          nombre: p.nombres,
          correo: p.correo,
          id: p.id
        },
        tk: token
      }
    } else {
      throw new HttpErrors[401]("Datos inválidos - No existe");
    }
  }

  @post('/asesors')
  @response(200, {
    description: 'Asesor model instance',
    content: {'application/json': {schema: getModelSchemaRef(Asesor)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Asesor, {
            title: 'NewAsesor',
            exclude: ['id'],
          }),
        },
      },
    })
    asesor: Omit<Asesor, 'id'>,
  ): Promise<Asesor> {
    let claves = this.servicioAutenticacion.generarClave();
    let claveCifradas = this.servicioAutenticacion.cifrarClave(claves);

    asesor.contrasena = claveCifradas;
    let p = await this.asesorRepository.create(asesor);

    //notificar por correo
    let Correo = asesor.correo;
    let Asunto = "Registrado en Smart Vehicle";
    let Contenido = `Hola ${asesor.nombres}, los datos de su cuenta en Smart Vehicle son:\n\n Usuario: ${asesor.correo}\n y Contraseña: ${claves}`;

    fetch(`${Llaves.urlNotificaciones}/email?Correo=${Correo}&Asunto=${Asunto}&Contenido=${Contenido}`)
      .then(
        (data: any) => {
          console.log(data);
        }
      )

    return p;
  }

  @get('/asesors/count')
  @response(200, {
    description: 'Asesor model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Asesor) where?: Where<Asesor>,
  ): Promise<Count> {
    return this.asesorRepository.count(where);
  }

  @get('/asesors')
  @response(200, {
    description: 'Array of Asesor model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Asesor, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Asesor) filter?: Filter<Asesor>,
  ): Promise<Asesor[]> {
    return this.asesorRepository.find(filter);
  }

  @patch('/asesors')
  @response(200, {
    description: 'Asesor PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Asesor, {partial: true}),
        },
      },
    })
    asesor: Asesor,
    @param.where(Asesor) where?: Where<Asesor>,
  ): Promise<Count> {
    return this.asesorRepository.updateAll(asesor, where);
  }

  @get('/asesors/{id}')
  @response(200, {
    description: 'Asesor model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Asesor, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Asesor, {exclude: 'where'}) filter?: FilterExcludingWhere<Asesor>
  ): Promise<Asesor> {
    return this.asesorRepository.findById(id, filter);
  }

  @patch('/asesors/{id}')
  @response(204, {
    description: 'Asesor PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Asesor, {partial: true}),
        },
      },
    })
    asesor: Asesor,
  ): Promise<void> {
    await this.asesorRepository.updateById(id, asesor);
  }

  @put('/asesors/{id}')
  @response(204, {
    description: 'Asesor PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() asesor: Asesor,
  ): Promise<void> {
    await this.asesorRepository.replaceById(id, asesor);
  }

  @del('/asesors/{id}')
  @response(204, {
    description: 'Asesor DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.asesorRepository.deleteById(id);
  }
}
