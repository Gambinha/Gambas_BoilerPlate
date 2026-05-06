import * as bcrypt from 'bcrypt';

export class CryptoUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Gera um hash para um dado em plaintext (ex: senha).
   * @param data O dado a ser "hasheado"
   * @returns Uma string contendo o hash
   */
  static async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.SALT_ROUNDS);
  }

  /**
   * Compara um dado em plaintext com um hash existente.
   * @param data O dado em plaintext (ex: senha enviada no login)
   * @param encrypted O hash salvo no banco de dados
   * @returns True se a combinação for válida, false caso contrário
   */
  static async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
