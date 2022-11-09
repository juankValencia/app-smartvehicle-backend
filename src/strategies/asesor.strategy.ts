import {AuthenticationStrategy} from '@loopback/authentication';
import {service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {autenticacionService} from '../services';

export class EstrategiaAsesor implements AuthenticationStrategy {
  name: string = "asesor";

  constructor(
    @service(autenticacionService)
    public servicioAutenticacion: autenticacionService
  ) { }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let token = parseBearerToken(request);
    if (token) {
      let datos = this.servicioAutenticacion.ValidarToken(token);
      if (datos) {
        if (datos.data.rol == "Asesor") {
          let perfil: UserProfile = Object.assign({
            nombre: datos.data.nombre
          });
          return perfil;
        }
      } else {
        throw new HttpErrors[401]("Token inválido");
      }
    } else {
      throw new HttpErrors[401]("No hay token en la petición");
    }
  }
}
