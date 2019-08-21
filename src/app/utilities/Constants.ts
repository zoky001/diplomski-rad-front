import { SearchType } from '../model/SearchType';
import { Codebooks } from '../model/codebooks';

export class Constants {
  public static MB_REGEX: string = '^([0-9]{8})?$';
  public static SMB_REGEX: string = '^([0-9]{3})?$';
  public static SEARCH_TYPE_MB: SearchType = new SearchType('MB', 'Matični broj', '^([0-9]{8})([0-9]{3})?$', 'Maticni broj mora sadrzavati 8 ili 11 znamenki', 10, 11);
  public static SEARCH_TYPE_OIB: SearchType = new SearchType('OIB', 'OIB', '^[0-9]{11}$', 'OIB mora sadrzavati tocno 11 znamenki', 4, 11);
  public static SEARCH_TYPE_KPO: SearchType = new SearchType('KPO', 'KPO', '^([0-9]{3,13})(KPO)?$', 'KPO mora sadrzavati 3-13 znamenki', 4, 13);
  public static SEARCH_TYPE_NAME: SearchType = new SearchType('NAME', 'Naziv klijenta', '^.{3,}$', 'Naziv mora sadrzavati minimalno 3 znaka', 12);
  public static SEARCH_TYPES_ALL: SearchType[] = [Constants.SEARCH_TYPE_MB, Constants.SEARCH_TYPE_OIB, Constants.SEARCH_TYPE_KPO, Constants.SEARCH_TYPE_NAME];


  public static ARCHIVE_SEARCH_TYPE_MB: SearchType = new SearchType('MB', 'Matični broj', '^([0-9]{8})([0-9]{3})?$', 'Maticni broj mora sadrzavati 8 ili 11 znamenki', 4, 11);
  public static ARCHIVE_SEARCH_TYPE_KPO: SearchType = new SearchType('KPO', 'KPO', '^([0-9]{3,13})(KPO)?$', 'KPO mora sadrzavati 3-13 znamenki', 2, 13);

  public static ARCHIVE_SEARCH_TYPES: SearchType[] = [
    Constants.ARCHIVE_SEARCH_TYPE_MB,
    Constants.ARCHIVE_SEARCH_TYPE_KPO
  ];


  public static CODEBOOKS: Codebooks[] = [Codebooks.INT_RATING, Codebooks.TAKER, Codebooks.RISK_CLASS, Codebooks.TYPE, Codebooks.RATING_RELATION, Codebooks.RATING_MODEL];


  public static CURRENCY_HRK: String = 'HRK';
  public static CURRENCY_EUR: String = 'EUR';

  public static EXPOSURE_VIEW_CURRENT_GROUP_MEMBERS: String = 'Dohvat po trenutnim članicama grupe';
  public static EXPOSURE_VIEW_HISTORY_GROUP_MEMBERS: String = 'Dohvat po povijesnim članicama grupe';



  public static APL_CUT: string = 'CUT';
  public static OZNAKA_HRK: string = 'HRK';
  public static OZNAKA_EUR: string = 'EUR';
  public static EXCHANGE_STOCK_RETAIL: string = '001';
  public static DEFAULT_TAKER: string = '35';
  public static TENOR_VALIDATION_DATE: string = '[0-9]{2}[.]{1}[0-9]{2}[.]{1}[0-9]{4}[.]?';
  public static TENOR_VALIDATION_DATE_AND_STRING: string = '[0-9]{2}[.]{1}[0-9]{2}[.]{1}[0-9]{4}.*';
  public static RISPO_EXPOSURE_REMOVE: string = 'Brisanje Izlozenosti'; // rispo.exposure.remove=Brisanje Izlozenosti
  public static RISPO_EXPOSURE_REMOVE_QUESTION: string = 'Jeste li sigurni da zelite obrisati odabranu izlozenost'; // rispo.exposure.remove=Brisanje Izlozenosti
  public static RISPO_EXPOSURE_REMOVE_SUCCESS: string = 'Izlozenost uspjesno obrisana'; // rispo.exposure.remove.success=Izlozenost uspjesno obrisana
  public static RISPO_EXPOSURE_REMOVE_ERROR: string = 'Greska kod brisanja izlozenosti'; // rispo.exposure.remove.error=Greska kod brisanja izlozenosti

  public static RISPO_EXPOSURE_GROUP: string = 'Grupiranje izlozenosti'; // rispo.exposure.group=Grupiranje izlozenosti
  public static RISPO_EXPOSURE_GROUP_SUCCESS: string = 'Izlozenosti uspjesno grupirane'; // rispo.exposure.group.success=Izlozenosti uspjesno grupirane
  public static RISPO_EXPOSURE_GROUP_ERROR: string = 'Greska kod grupiranja izlozenosti'; // rispo.exposure.group.error=Greska kod grupiranja izlozenosti
  public static RISPO_EXPOSURE_UNGROUP_SUCCESS: string = 'Izlozenosti uspjesno odgrupirane'; // rispo.exposure.ungroup.success=Izlozenosti uspjesno odgrupirane
  public static RISPO_EXPOSURE_UNGROUP_ERROR: string = 'Greska kod odgrupiravanja izlozenosti'; // rispo.exposure.ungroup.error=Greska kod odgrupiravanja izlozenosti

  // ****************************************************************************************************************************************************************************
  //                                                                                         MESSAGES
  // ****************************************************************************************************************************************************************************
  public static GROUP_FETCH: String = 'Dohvat grupe'; // 'rispo.group.fetch';
  public static GROUP_FETCH_ERROR: String = 'Greska prilikom dohvata grupe'; // 'rispo.group.fetch.error';
  public static GROUP_FETCH_TIMEOUT: String = 'Isteklo vrijeme dohvata. Molimo pokusajte ponovno!'; // 'rispo.group.fetch.timeout';
  public static GROUP_ALL_FETCH_ERROR: String = 'Greska prilikom dohvata svih grupa!'; // 'rispo.group.all.fetch.error';

  public static GROUP_LOCK: String = 'Zakljucavanje grupe'; // 'rispo.group.lock';
  public static GROUP_LOCK_ERROR: String = 'Greska kod zakljucavanja grupe'; // 'rispo.group.lock.error';
  public static GROUP_LOCK_SUCCESS: String = 'Grupa uspjesno zakljucana'; // 'rispo.group.lock.success';

  public static REPORTS_FETCH_CREATING: String = 'Izvjestaj je u procesu kreiranja'; // 'rispo.reports.creating';

  public static CLIENT_FETCH: String = 'Dohvat klijenata'; // 'rispo.client.fetch';
  public static CLIENT_FETCH_ERROR: String = 'Greska prilikom dohvata klijenata'; // 'rispo.client.fetch.error';
  public static CLIENT_FETCH_TIMEOUT: String = 'Isteklo vrijeme dohvata. Molimo pokusajte ponovno!'; // 'rispo.client.fetch.timeout';

  public static REPORTS_FETCH: String = 'Dohvat izvjestaja'; //  'rispo.reports.fetch';
  public static REPORTS_FETCH_ERROR: String = 'Greska prilikom dohvata izvjestaja'; // 'rispo.reports.fetch.error';
  public static REPORTS_DELETE: String = 'Brisanje izvjestaja'; // 'rispo.reports.delete';
  public static REPORTS_DELETE_SUCCESS: String = 'Izvjestaj uspjesno obrisan'; // 'rispo.reports.delete.success';
  public static REPORTS_DELETE_ERROR: String = 'Greska kod brisanja izvjestaja'; //  'rispo.reports.delete.error';


  public static CODEBOOK_UPDATE: String = 'Azuriranje sifrarnika'; // 'rispo.codebooks.update';
  public static CODEBOOK_UPDATE_SUCCESS: String = 'Sifrarnik uspjesno azuriran'; // 'rispo.codebooks.update.success';
  public static CODEBOOK_UPDATE_ERROR: String = 'Greska kod azuriranja sifrarnika'; // 'rispo.codebooks.update.error';
  public static CODEBOOK_REMOVE: String = 'Brisanje sifrarnika'; // 'rispo.codebooks.delete';
  public static CODEBOOK_REMOVE_SUCCESS: String = 'Sifrarnik uspjesno obrisan'; // 'rispo.codebooks.delete.success';
  public static CODEBOOK_ADD: String = 'Dodavanje sifrarnika'; // 'rispo.codebooks.add';
  public static CODEBOOK_ADD_SUCCESS: String = 'Sifrarnik uspjesno dodan'; // 'rispo.codebooks.add.succes';
  public static CODEBOOK_ADD_ERROR: String = 'Sifrarnik uspjesno dodan'; // 'rispo.codebooks.add.succes';
  public static CODEBOOK_REMOVE_ERROR: String = 'Greska kod brisanja sifrarnika'; // 'rispo.codebooks.delete.error';


  public static REPORTS_DENIED: String = 'Nemate prava pregleda trazene grupe'; // 'rispo.reports.denied';

  public static CLIENT_GROUP: String = 'Grupiranje klijenata'; //  'rispo.client.group';
  public static CLIENT_GROUP_ERROR: String = 'Greska kod grupiranja klijenata'; // 'rispo.client.group.error';
  public static CLIENT_GROUP_SUCCESS: String = 'Klijenti uspjesno grupirani '; // 'rispo.client.group.success';
  public static CLIENT_UDGROUP_SUCCESS: String = 'Klijent uspjesno odgrupiran '; //  'rispo.client.ungroup.success';
  public static CLIENT_UDGROUP_ERROR: String = 'Greska kod odgrupiravanja klijenta'; // 'rispo.client.ungroup.error';

  public static CLIENT_REMOVE: String = 'Brisanje klijenta'; //  'rispo.client.remove';
  public static CLIENT_REMOVE_ERROR: String = 'Greska kod brisanja klijenta'; //  'rispo.client.remove.error';
  public static CLIENT_REMOVE_SUCCESS: string[] = ['Klijent', 'uspjesno obrisan']; //  'rispo.client.remove.success';


  public static CLIENT_SAVE: String = 'Spremanje klijenta'; //  'rispo.client.save';
  public static CLIENT_SAVE_ERROR: String = 'Greska kod spremanja klijenta'; //  'rispo.client.save.error';

  public static CLIENT_ADD: String = 'Dodavanje klijenta'; //  'rispo.client.add';
  public static CLIENT_ADD_SUCCESS: string[] = ['Klijent ', 'uspjesno dodan']; //  'rispo.client.add.success';

  public static CLIENT_UPDATE: String = 'Azuriranje klijenta'; //  'rispo.client.update';
  public static CLIENT_UPDATE_SUCCESS: string[] = ['Klijent', 'uspjesno azuriran']; //  'rispo.client.update.success';
  public static CLIENT_PRIMARY_SUCCESS: String = 'Matica uspjesno postavljena'; //  'rispo.client.primary.success';
  public static CLIENT_PRIMARY_ERROR: String = 'Greska kod postavljanja matice'; //  'rispo.client.primary.error';


  public static EXPORT_EXCEL: String = 'Export u excel'; //  'rispo.export.excel';
  public static EXPORT_EXCEL_ERROR: String = 'Greska kod ucitavanja predloska. Provjerite korektnost unosa podataka za polja oznacena crvenom bojom!'; //  'rispo.export.excel.error';
  public static EXPORT_EXCEL_GROUP: String = 'Ne postoji grupa za export'; //  'rispo.export.excel.group';
  public static EXPORT_EXCEL_EMPTY: String = 'Grupa nema clanova za izvoz'; //  'rispo.export.excel.empty';
  public static EXPORT_EXCEL_LIMIT: String = 'Grupa ima vise od 40 clanova'; //  'rispo.export.excel.limit';


  public static RISPO_EXPOSURE_ADD_SUCCESS: string[] = ['Izlozenost za klijenta ', ' uspjesno dodana']; // rispo.exposure.add.success=Izlozenost za klijenta {0} uspjesno dodana
  public static RISPO_EXPOSURE_ADD: string = 'Dodavanje izlozenosti'; // rispo.exposure.add=Dodavanje izlozenosti
  public static RISPO_EXPOSURE_UPDATE: string = 'Azuriranje izlozenosti'; // rispo.exposure.update=Azuriranje izlozenosti
  public static RISPO_EXPOSURE_UPDATE_SUCCESS: string = 'Izlozenost uspjesno azurirana'; // rispo.exposure.update.success=Izlozenost uspjesno azurirana
}

