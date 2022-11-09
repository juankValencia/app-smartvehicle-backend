import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Llaves} from '../config/llaves';
import {Administrador, Asesor, Cliente} from '../models';
import {AdministradorRepository, AsesorRepository, ClienteRepository} from '../repositories';
const generador = require("password-generator");
const cryptojs = require("crypto-js");
const jwt = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class autenticacionService {
  constructor(
    @repository(ClienteRepository)
    public clienteRepository: ClienteRepository,
    @repository(AdministradorRepository)
    public adminRepository: AdministradorRepository,
    @repository(AsesorRepository)
    public asesorRepository: AsesorRepository
  ) { }

  /*
   * Add service methods here
   */

  generarClave() {
    let clave = generador(8, false);
    return clave;
  }

  cifrarClave(clave: string) {
    let claveCifrada = cryptojs.MD5(clave.toString);
    return claveCifrada;
  }

  //Autenticar por Tokens
  IdentificarCliente(usuario: string, clave: string) {
    try {
      let c = this.clienteRepository.findOne({where: {correo: usuario, contrasena: clave}});
      if (c) {
        return c;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  IdentificarAdmin(usuario: string, clave: string) {
    try {
      let c = this.adminRepository.findOne({where: {correo: usuario, contrasena: clave}});
      if (c) {
        return c;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  IdentificarAsesor(usuario: string, clave: string) {
    try {
      let c = this.asesorRepository.findOne({where: {correo: usuario, contrasena: clave}});
      if (c) {
        return c;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  GenerarTokenAdminJWT(admin: Administrador) {
    let token = jwt.sign({
      data: {
        id: admin.id,
        correo: admin.correo,
        nombre: admin.nombres + " " + admin.apellidos,
        rol: "Admin"
      }
    }, Llaves.claveJWT);
    return token;
  }

  GenerarTokenAsesorJWT(asesor: Asesor) {
    let token = jwt.sign({
      data: {
        id: asesor.id,
        correo: asesor.correo,
        nombre: asesor.nombres + " " + asesor.apellidos,
        rol: "Asesor"
      }
    }, Llaves.claveJWT);
    return token;
  }

  GenerarTokenClienteJWT(cliente: Cliente) {
    let token = jwt.sign({
      data: {
        id: cliente.id,
        correo: cliente.correo,
        nombre: cliente.nombres + " " + cliente.apellidos,
        rol: "Cliente"
      }
    }, Llaves.claveJWT);
    return token;
  }

  ValidarToken(token: string) {
    try {
      let datos = jwt.verify(token, Llaves.claveJWT);
      return datos;
    } catch (error) {
      return false;
    }
  }

}
