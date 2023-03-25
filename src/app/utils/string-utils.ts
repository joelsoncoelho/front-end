export class StringUtils {

  public static isNullOrEmpty(valor: string): boolean {
    if (valor === undefined || valor === null || valor.trim() === '') {
      return true;
    }
    return false;
  }

  public static somenteNumeros(numero: string): string {
    return numero.replace(/\D/g,'');
  }

}
